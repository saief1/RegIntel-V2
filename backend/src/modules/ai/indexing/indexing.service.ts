import { Inject, Injectable } from '@nestjs/common';
import {
  EmbeddingEntityType,
  IndexingJobKind,
  IndexingJobStatus,
} from '@prisma/client';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { EmbeddingsService } from '../embeddings/embeddings.service';
import { VECTOR_STORE, VectorStore } from '../vector/vector.types';
import {
  IndexDocumentInput,
  IndexJobRequest,
  ParsedDocument,
} from './indexing.types';

/**
 * C006 — Regulatory Knowledge Index
 * Pipeline: parse → chunk → metadata → embed → vector store
 */
@Injectable()
export class IndexingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly embeddings: EmbeddingsService,
    @Inject(VECTOR_STORE) private readonly store: VectorStore,
  ) {}

  parseContent(
    title: string,
    content: string,
    metadata?: Record<string, unknown>,
  ): ParsedDocument {
    const cleaned = content.replace(/\r\n/g, '\n').trim();
    return {
      title: title.trim() || 'Untitled',
      content: cleaned,
      metadata: {
        ...(metadata ?? {}),
        charCount: cleaned.length,
        wordCount: cleaned.split(/\s+/).filter(Boolean).length,
      },
    };
  }

  async indexDocument(input: IndexDocumentInput) {
    const namespace = input.namespace ?? 'default';
    const parsed = this.parseContent(
      input.title,
      input.content,
      input.metadata,
    );
    const existing = await this.prisma.embeddingDocument.findUnique({
      where: {
        organizationId_namespace_entityType_entityId: {
          organizationId: input.organizationId,
          namespace,
          entityType: input.entityType,
          entityId: input.entityId,
        },
      },
    });

    const result = await this.embeddings.embedEntity({
      organizationId: input.organizationId,
      userId: input.userId,
      entityType: input.entityType,
      entityId: input.entityId,
      title: parsed.title,
      content: parsed.content,
      namespace,
      metadata: {
        ...parsed.metadata,
        workspaceId: input.workspaceId,
        sourceVersion: input.sourceVersion,
      },
      force: input.force,
    });

    if (!result.skipped) {
      const doc = await this.prisma.embeddingDocument.findUnique({
        where: { id: result.documentId },
        include: { chunks: { orderBy: { chunkIndex: 'asc' } } },
      });
      if (doc) {
        const nextVersion = existing ? existing.contentVersion + 1 : 1;
        await this.prisma.embeddingDocument.update({
          where: { id: doc.id },
          data: {
            contentVersion: nextVersion,
            sourceVersion: input.sourceVersion,
            workspaceId: input.workspaceId,
          },
        });
        if (existing) {
          await this.prisma.embeddingDocumentVersion.create({
            data: {
              organizationId: input.organizationId,
              documentId: doc.id,
              contentVersion: existing.contentVersion,
              contentHash: existing.contentHash,
              sourceVersion: existing.sourceVersion,
              title: existing.title,
              chunkCount: existing.chunkCount,
              chunksSnapshot: doc.chunks.map((c) => ({
                chunkIndex: c.chunkIndex,
                content: c.content,
                contentHash: c.contentHash,
              })),
              metadata: existing.metadata ?? undefined,
            },
          });
        }
      }
    }

    if (input.relationships?.length) {
      for (const rel of input.relationships) {
        await this.prisma.knowledgeRelationship.upsert({
          where: {
            organizationId_fromEntityType_fromEntityId_toEntityType_toEntityId_relationType:
              {
                organizationId: input.organizationId,
                fromEntityType: input.entityType,
                fromEntityId: input.entityId,
                toEntityType: rel.toEntityType,
                toEntityId: rel.toEntityId,
                relationType: rel.relationType,
              },
          },
          create: {
            organizationId: input.organizationId,
            fromEntityType: input.entityType,
            fromEntityId: input.entityId,
            toEntityType: rel.toEntityType,
            toEntityId: rel.toEntityId,
            relationType: rel.relationType,
            weight: rel.weight ?? 1,
          },
          update: { weight: rel.weight ?? 1 },
        });
      }
    }

    return {
      ...result,
      namespace,
      entityType: input.entityType,
      entityId: input.entityId,
    };
  }

  async deleteIndexedEntity(
    organizationId: string,
    entityType: EmbeddingEntityType,
    entityId: string,
    namespace = 'default',
  ) {
    const deleted = await this.store.deleteByEntity(
      organizationId,
      namespace,
      entityType,
      entityId,
    );
    await this.prisma.embeddingDocument.deleteMany({
      where: { organizationId, namespace, entityType, entityId },
    });
    await this.prisma.knowledgeRelationship.deleteMany({
      where: {
        organizationId,
        OR: [
          { fromEntityType: entityType, fromEntityId: entityId },
          { toEntityType: entityType, toEntityId: entityId },
        ],
      },
    });
    return { deletedChunks: deleted, entityType, entityId, namespace };
  }

  async runJob(request: IndexJobRequest) {
    const namespace = request.namespace ?? 'default';
    const job = await this.prisma.indexingJob.create({
      data: {
        organizationId: request.organizationId,
        kind: request.kind,
        status: IndexingJobStatus.RUNNING,
        entityType: request.entityType,
        entityId: request.entityId,
        namespace,
        workspaceId: request.workspaceId,
        startedAt: new Date(),
      },
    });

    try {
      if (
        request.kind === IndexingJobKind.DELETE &&
        request.entityType &&
        request.entityId
      ) {
        const result = await this.deleteIndexedEntity(
          request.organizationId,
          request.entityType,
          request.entityId,
          namespace,
        );
        await this.finishJob(job.id, 1, 1);
        return { jobId: job.id, status: 'COMPLETED', result };
      }

      const sources = await this.collectDomainSources(
        request.organizationId,
        request.entityType,
        request.entityId,
        request.full === true || request.kind === IndexingJobKind.REINDEX,
      );

      await this.prisma.indexingJob.update({
        where: { id: job.id },
        data: { total: sources.length },
      });

      let progress = 0;
      const results = [];
      for (const source of sources) {
        const indexed = await this.indexDocument({
          organizationId: request.organizationId,
          ...source,
          namespace,
          workspaceId: request.workspaceId,
          force: request.kind === IndexingJobKind.REINDEX,
        });
        results.push(indexed);
        progress += 1;
        await this.prisma.indexingJob.update({
          where: { id: job.id },
          data: { progress },
        });
      }

      await this.finishJob(job.id, progress, sources.length);
      return {
        jobId: job.id,
        status: 'COMPLETED',
        indexed: results.length,
        results,
      };
    } catch (err) {
      await this.prisma.indexingJob.update({
        where: { id: job.id },
        data: {
          status: IndexingJobStatus.FAILED,
          errorMessage: err instanceof Error ? err.message : String(err),
          completedAt: new Date(),
        },
      });
      throw err;
    }
  }

  async getJob(organizationId: string, jobId: string) {
    return this.prisma.indexingJob.findFirst({
      where: { id: jobId, organizationId },
    });
  }

  async listJobs(organizationId: string, take = 20) {
    return this.prisma.indexingJob.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
      take,
    });
  }

  private async finishJob(jobId: string, progress: number, total: number) {
    await this.prisma.indexingJob.update({
      where: { id: jobId },
      data: {
        status: IndexingJobStatus.COMPLETED,
        progress,
        total,
        completedAt: new Date(),
      },
    });
  }

  /** Gather domain entities for incremental / full indexing. */
  private async collectDomainSources(
    organizationId: string,
    entityType?: EmbeddingEntityType,
    entityId?: string,
    full = false,
  ): Promise<
    Array<{
      entityType: EmbeddingEntityType;
      entityId: string;
      title: string;
      content: string;
      sourceVersion?: string;
      metadata?: Record<string, unknown>;
      relationships?: IndexDocumentInput['relationships'];
    }>
  > {
    if (entityType && entityId && !full) {
      const single = await this.loadSingleEntity(
        organizationId,
        entityType,
        entityId,
      );
      return single ? [single] : [];
    }

    const out: Array<{
      entityType: EmbeddingEntityType;
      entityId: string;
      title: string;
      content: string;
      sourceVersion?: string;
      metadata?: Record<string, unknown>;
      relationships?: IndexDocumentInput['relationships'];
    }> = [];

    const types = entityType
      ? [entityType]
      : ([
          'POLICY',
          'DOCUMENT',
          'CASE',
          'TASK',
          'REPORT',
          'REGULATION',
          'GUIDANCE',
          'CONTROL',
          'PROCEDURE',
        ] as EmbeddingEntityType[]);

    for (const t of types) {
      if (t === 'POLICY') {
        const policies = await this.prisma.policy.findMany({
          where: { organizationId, deletedAt: null },
          include: { versions: { orderBy: { version: 'desc' }, take: 1 } },
        });
        for (const p of policies) {
          const ver = p.versions[0];
          out.push({
            entityType: 'POLICY',
            entityId: p.id,
            title: p.title,
            content: [
              p.title,
              p.description ?? '',
              ver?.content ?? '',
              `Category: ${p.category ?? 'n/a'}`,
              `Tags: ${p.tags.join(', ')}`,
            ].join('\n\n'),
            sourceVersion: String(ver?.version ?? p.version),
            metadata: {
              category: p.category,
              status: p.status,
              docType: 'policy',
            },
          });
        }
      } else if (
        t === 'DOCUMENT' ||
        t === 'CONTROL' ||
        t === 'PROCEDURE' ||
        t === 'GUIDANCE'
      ) {
        const docs = await this.prisma.knowledgeDocument.findMany({
          where: { organizationId, deletedAt: null },
        });
        for (const d of docs) {
          const mappedType =
            d.collection === 'controls'
              ? 'CONTROL'
              : d.collection === 'procedures'
                ? 'PROCEDURE'
                : d.collection === 'guidance' || d.collection === 'regulations'
                  ? 'GUIDANCE'
                  : 'DOCUMENT';
          if (
            entityType &&
            mappedType !== entityType &&
            entityType !== 'DOCUMENT'
          ) {
            continue;
          }
          out.push({
            entityType: mappedType,
            entityId: d.id,
            title: d.title,
            content: [d.title, d.summary ?? '', d.body ?? ''].join('\n\n'),
            sourceVersion: String(d.version),
            metadata: {
              collection: d.collection,
              tags: d.tags,
              docType: mappedType.toLowerCase(),
            },
          });
        }
      } else if (t === 'CASE') {
        const cases = await this.prisma.case.findMany({
          where: { organizationId, deletedAt: null },
        });
        for (const c of cases) {
          out.push({
            entityType: 'CASE',
            entityId: c.id,
            title: c.title,
            content: [
              c.title,
              c.summary ?? '',
              `Status: ${c.status}`,
              `Priority: ${c.priority}`,
            ].join('\n\n'),
            sourceVersion: String(c.version),
            metadata: {
              status: c.status,
              priority: c.priority,
              docType: 'case',
            },
          });
        }
      } else if (t === 'TASK') {
        const tasks = await this.prisma.task.findMany({
          where: { organizationId, deletedAt: null },
        });
        for (const task of tasks) {
          out.push({
            entityType: 'TASK',
            entityId: task.id,
            title: task.title,
            content: [
              task.title,
              task.description ?? '',
              `Status: ${task.status}`,
              `Priority: ${task.priority}`,
            ].join('\n\n'),
            sourceVersion: String(task.version),
            metadata: {
              status: task.status,
              caseId: task.caseId,
              docType: 'task',
            },
            relationships: task.caseId
              ? [
                  {
                    toEntityType: 'CASE',
                    toEntityId: task.caseId,
                    relationType: 'RELATED',
                  },
                ]
              : undefined,
          });
        }
      } else if (t === 'REPORT') {
        const reports = await this.prisma.report.findMany({
          where: { organizationId, deletedAt: null },
        });
        for (const r of reports) {
          out.push({
            entityType: 'REPORT',
            entityId: r.id,
            title: r.title,
            content: [
              r.title,
              r.description ?? '',
              `Type: ${r.reportType}`,
              `Status: ${r.status}`,
            ].join('\n\n'),
            metadata: { reportType: r.reportType, docType: 'report' },
          });
        }
      } else if (t === 'REGULATION') {
        // Seeded regulation knowledge lives as knowledge docs with collection=regulations
        // or as embedding docs already present; skip empty.
      }
    }

    return out;
  }

  private async loadSingleEntity(
    organizationId: string,
    entityType: EmbeddingEntityType,
    entityId: string,
  ) {
    const all = await this.collectDomainSources(
      organizationId,
      entityType,
      undefined,
      true,
    );
    return all.find(
      (s) => s.entityId === entityId && s.entityType === entityType,
    );
  }
}
