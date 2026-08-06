import { Inject, Injectable } from '@nestjs/common';
import { EmbeddingEntityType } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { AI_PROVIDER, AIProvider } from '../providers/ai-provider.types';
import {
  VECTOR_STORE,
  VectorHit,
  VectorStore,
  cosineSimilarity,
  keywordBoost,
} from '../vector/vector.types';

export type RetrievalFilters = {
  organizationId: string;
  namespace?: string;
  workspaceId?: string;
  entityTypes?: EmbeddingEntityType[];
  docTypes?: string[];
  metadataEquals?: Record<string, string | number | boolean>;
};

export type RetrieveRequest = {
  organizationId: string;
  userId?: string;
  query: string;
  topK?: number;
  similarityThreshold?: number;
  filters?: Omit<RetrievalFilters, 'organizationId'>;
  sessionId?: string;
  queryId?: string;
  includeRelated?: boolean;
  recommendPolicies?: boolean;
};

export type RetrievalHit = {
  chunkId: string;
  entityType: EmbeddingEntityType;
  entityId: string;
  chunkIndex: number;
  title: string;
  content: string;
  score: number;
  vectorScore: number;
  keywordScore: number;
  freshnessScore: number;
  contentVersion?: number;
  metadata?: Record<string, unknown>;
};

export type RetrieveResult = {
  hits: RetrievalHit[];
  related: Array<{
    entityType: EmbeddingEntityType;
    entityId: string;
    relationType: string;
    weight: number;
  }>;
  recommendedPolicies: Array<{
    entityId: string;
    title: string;
    score: number;
  }>;
  useVector: boolean;
  useHybrid: boolean;
  latencyMs: number;
  queryEmbeddingDims: number;
};

/**
 * C007 — Retrieval Engine
 * Semantic + hybrid (vector cosine + keyword), filters, threshold, ranking.
 */
@Injectable()
export class RetrievalService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    @Inject(AI_PROVIDER) private readonly provider: AIProvider,
    @Inject(VECTOR_STORE) private readonly store: VectorStore,
  ) {}

  async retrieve(request: RetrieveRequest): Promise<RetrieveResult> {
    const started = Date.now();
    const topK = request.topK ?? 8;
    const threshold = request.similarityThreshold ?? 0.15;
    const namespace = request.filters?.namespace ?? 'default';
    const useVector =
      this.config.get<boolean>('featureFlags.useVectorSearch') === true;
    const useHybrid = true;

    let queryVector: number[] = [];
    if (useVector) {
      try {
        const embedded = await this.provider.embed({
          texts: [request.query],
          organizationId: request.organizationId,
        });
        queryVector = embedded.embeddings[0] ?? [];
      } catch {
        queryVector = [];
      }
    }

    let vectorHits: VectorHit[] = [];
    if (useVector && queryVector.length) {
      vectorHits = await this.store.similaritySearch({
        vector: queryVector,
        topK: topK * 3,
        filter: {
          organizationId: request.organizationId,
          namespace,
          entityTypes: request.filters?.entityTypes,
          metadataEquals: request.filters?.metadataEquals,
        },
        queryText: request.query,
      });
    }

    const keywordHits = await this.keywordSearch({
      organizationId: request.organizationId,
      namespace,
      query: request.query,
      topK: topK * 3,
      entityTypes: request.filters?.entityTypes,
      workspaceId: request.filters?.workspaceId,
      docTypes: request.filters?.docTypes,
    });

    const merged = this.mergeRankDedup(
      vectorHits,
      keywordHits,
      queryVector,
      request.query,
      threshold,
      topK,
    );

    const related = request.includeRelated
      ? await this.loadRelated(request.organizationId, merged)
      : [];

    const recommendedPolicies = request.recommendPolicies
      ? await this.recommendPolicies(
          request.organizationId,
          merged,
          request.query,
        )
      : [];

    const latencyMs = Date.now() - started;

    await this.prisma.retrievalLog.create({
      data: {
        organizationId: request.organizationId,
        queryId: request.queryId,
        operation: 'retrieve',
        useVector,
        useHybrid,
        topK,
        hitCount: merged.length,
        latencyMs,
        filters: request.filters ?? {},
        scores: merged.map((h) => ({
          chunkId: h.chunkId,
          score: h.score,
          entityType: h.entityType,
        })),
      },
    });

    return {
      hits: merged,
      related,
      recommendedPolicies,
      useVector,
      useHybrid,
      latencyMs,
      queryEmbeddingDims: queryVector.length,
    };
  }

  private async keywordSearch(input: {
    organizationId: string;
    namespace: string;
    query: string;
    topK: number;
    entityTypes?: EmbeddingEntityType[];
    workspaceId?: string;
    docTypes?: string[];
  }): Promise<
    Array<{
      id: string;
      entityType: EmbeddingEntityType;
      entityId: string;
      chunkIndex: number;
      content: string;
      metadata: Record<string, unknown> | null;
      documentTitle: string;
      contentVersion: number;
      indexedAt: Date;
      embedding: number[] | null;
    }>
  > {
    const terms = input.query
      .toLowerCase()
      .split(/\s+/)
      .filter((t) => t.length > 2)
      .slice(0, 8);
    if (!terms.length) return [];

    const chunks = await this.prisma.embeddingChunk.findMany({
      where: {
        organizationId: input.organizationId,
        namespace: input.namespace,
        ...(input.entityTypes?.length
          ? { entityType: { in: input.entityTypes } }
          : {}),
        OR: terms.map((term) => ({
          content: { contains: term, mode: 'insensitive' as const },
        })),
      },
      take: input.topK * 2,
      include: {
        document: {
          select: {
            title: true,
            contentVersion: true,
            indexedAt: true,
            workspaceId: true,
            metadata: true,
          },
        },
      },
    });

    return chunks
      .filter((c) => {
        if (
          input.workspaceId &&
          c.document.workspaceId &&
          c.document.workspaceId !== input.workspaceId
        ) {
          return false;
        }
        if (input.docTypes?.length) {
          const meta = (c.metadata ?? c.document.metadata) as Record<
            string,
            unknown
          > | null;
          const rawDocType = meta?.docType;
          const docType =
            typeof rawDocType === 'string' ? rawDocType.toLowerCase() : '';
          if (!input.docTypes.map((d) => d.toLowerCase()).includes(docType)) {
            return false;
          }
        }
        return true;
      })
      .map((c) => ({
        id: c.id,
        entityType: c.entityType,
        entityId: c.entityId,
        chunkIndex: c.chunkIndex,
        content: c.content,
        metadata: (c.metadata as Record<string, unknown> | null) ?? null,
        documentTitle: c.document.title,
        contentVersion: c.document.contentVersion,
        indexedAt: c.document.indexedAt,
        embedding: Array.isArray(c.embedding)
          ? (c.embedding as unknown as number[])
          : null,
      }));
  }

  private mergeRankDedup(
    vectorHits: VectorHit[],
    keywordHits: Array<{
      id: string;
      entityType: EmbeddingEntityType;
      entityId: string;
      chunkIndex: number;
      content: string;
      metadata: Record<string, unknown> | null;
      documentTitle: string;
      contentVersion: number;
      indexedAt: Date;
      embedding: number[] | null;
    }>,
    queryVector: number[],
    queryText: string,
    threshold: number,
    topK: number,
  ): RetrievalHit[] {
    const byKey = new Map<string, RetrievalHit>();

    for (const h of vectorHits) {
      const key = `${h.entityType}:${h.entityId}:${h.chunkIndex}`;
      const kw = keywordBoost(h.content, queryText);
      const freshness = 0; // filled later if we have indexedAt
      const score = h.score + kw;
      byKey.set(key, {
        chunkId: h.id,
        entityType: h.entityType as EmbeddingEntityType,
        entityId: h.entityId,
        chunkIndex: h.chunkIndex,
        title:
          typeof h.metadata?.title === 'string'
            ? h.metadata.title
            : h.entityType,
        content: h.content,
        score,
        vectorScore: h.score,
        keywordScore: kw,
        freshnessScore: freshness,
        metadata: h.metadata,
      });
    }

    const now = Date.now();
    for (const h of keywordHits) {
      const key = `${h.entityType}:${h.entityId}:${h.chunkIndex}`;
      const kw = keywordBoost(h.content, queryText);
      const vectorScore =
        queryVector.length && h.embedding?.length
          ? cosineSimilarity(queryVector, h.embedding)
          : 0;
      const ageDays = (now - h.indexedAt.getTime()) / (1000 * 60 * 60 * 24);
      const freshness = Math.max(0, 0.1 - ageDays * 0.001);
      const score = vectorScore * 0.7 + kw + freshness;
      const existing = byKey.get(key);
      if (!existing || score > existing.score) {
        byKey.set(key, {
          chunkId: h.id,
          entityType: h.entityType,
          entityId: h.entityId,
          chunkIndex: h.chunkIndex,
          title: h.documentTitle,
          content: h.content,
          score,
          vectorScore,
          keywordScore: kw,
          freshnessScore: freshness,
          contentVersion: h.contentVersion,
          metadata: h.metadata ?? undefined,
        });
      } else if (existing) {
        existing.title = existing.title || h.documentTitle;
        existing.contentVersion = h.contentVersion;
        existing.freshnessScore = freshness;
        existing.score += freshness;
      }
    }

    // Duplicate removal at entity level: keep best chunk per entity after ranking
    const ranked = [...byKey.values()]
      .filter((h) => h.score >= threshold || h.keywordScore > 0)
      .sort((a, b) => b.score - a.score);

    const seenEntities = new Set<string>();
    const deduped: RetrievalHit[] = [];
    for (const hit of ranked) {
      const entityKey = `${hit.entityType}:${hit.entityId}`;
      // Allow up to 2 chunks per entity for context richness
      const count = [...seenEntities].filter((k) =>
        k.startsWith(entityKey),
      ).length;
      if (count >= 2) continue;
      seenEntities.add(`${entityKey}#${hit.chunkIndex}`);
      deduped.push(hit);
      if (deduped.length >= topK) break;
    }
    return deduped;
  }

  private async loadRelated(organizationId: string, hits: RetrievalHit[]) {
    if (!hits.length) return [];
    const ors = hits.map((h) => ({
      fromEntityType: h.entityType,
      fromEntityId: h.entityId,
    }));
    const rows = await this.prisma.knowledgeRelationship.findMany({
      where: { organizationId, OR: ors },
      take: 20,
    });
    return rows.map((r) => ({
      entityType: r.toEntityType,
      entityId: r.toEntityId,
      relationType: r.relationType,
      weight: r.weight,
    }));
  }

  private async recommendPolicies(
    organizationId: string,
    hits: RetrievalHit[],
    query: string,
  ) {
    const policyHits = hits.filter((h) => h.entityType === 'POLICY');
    if (policyHits.length) {
      return policyHits.slice(0, 5).map((h) => ({
        entityId: h.entityId,
        title: h.title,
        score: h.score,
      }));
    }
    const policies = await this.prisma.embeddingDocument.findMany({
      where: {
        organizationId,
        entityType: 'POLICY',
        OR: [
          {
            title: {
              contains: query.split(/\s+/)[0] ?? '',
              mode: 'insensitive',
            },
          },
          { title: { not: '' } },
        ],
      },
      take: 5,
      orderBy: { indexedAt: 'desc' },
    });
    return policies.map((p, i) => ({
      entityId: p.entityId,
      title: p.title,
      score: 0.5 - i * 0.05,
    }));
  }
}
