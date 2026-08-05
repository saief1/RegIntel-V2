import { Inject, Injectable } from '@nestjs/common';
import { EmbeddingEntityType } from '@prisma/client';
import { AI_REPOSITORY } from '../../../common/repositories/tokens';
import type { IAiRepository } from '../../../common/repositories/ai.repository';
import {
  AI_PROVIDER,
  AIProvider,
  AiProviderName as ProviderName,
} from '../providers/ai-provider.types';
import { PgVectorStore } from '../vector/pgvector.store';
import { VECTOR_STORE, VectorStore } from '../vector/vector.types';
import { chunkText, contentHash } from './chunking.util';

export type EmbedEntityInput = {
  organizationId: string;
  userId?: string;
  entityType: EmbeddingEntityType;
  entityId: string;
  title?: string;
  content: string;
  namespace?: string;
  metadata?: Record<string, unknown>;
  force?: boolean;
};

@Injectable()
export class EmbeddingsService {
  constructor(
    @Inject(AI_PROVIDER) private readonly provider: AIProvider,
    @Inject(VECTOR_STORE) private readonly store: VectorStore,
    @Inject(AI_REPOSITORY) private readonly aiRepo: IAiRepository,
    private readonly pgVector: PgVectorStore,
  ) {}

  async embedEntity(input: EmbedEntityInput) {
    const namespace = input.namespace ?? 'default';
    const hash = contentHash(input.content);
    const existing = await this.aiRepo.findDocument(
      input.organizationId,
      namespace,
      input.entityType,
      input.entityId,
    );
    if (existing && existing.contentHash === hash && !input.force) {
      return {
        documentId: existing.id,
        chunkCount: existing.chunkCount,
        skipped: true,
        reason: 'unchanged',
      };
    }

    const pieces = chunkText(input.content);
    const embedResult = pieces.length
      ? await this.provider.embed({
          texts: pieces.map((p) => p.content),
          organizationId: input.organizationId,
        })
      : {
          embeddings: [] as number[][],
          model: 'none',
          provider: this.provider.name,
          usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
          latencyMs: 0,
          costUsd: 0,
          dimensions: 0,
        };

    const doc = await this.aiRepo.upsertEmbeddingDocument({
      organizationId: input.organizationId,
      entityType: input.entityType,
      entityId: input.entityId,
      namespace,
      title: input.title ?? '',
      contentHash: hash,
      metadata: input.metadata as never,
      chunkCount: pieces.length,
    });

    const chunks = await this.aiRepo.replaceChunks(
      doc.id,
      pieces.map((p, i) => ({
        organizationId: input.organizationId,
        entityType: input.entityType,
        entityId: input.entityId,
        namespace,
        chunkIndex: p.index,
        content: p.content,
        embedding: embedResult.embeddings[i] ?? [],
        tokenCount: p.tokenCount,
        contentHash: p.contentHash,
        metadata: input.metadata as never,
      })),
    );

    await this.store.upsert(
      chunks.map((c) => ({
        id: c.id,
        organizationId: c.organizationId,
        namespace: c.namespace,
        entityType: c.entityType,
        entityId: c.entityId,
        chunkIndex: c.chunkIndex,
        content: c.content,
        embedding: (c.embedding as unknown as number[]) ?? [],
        metadata: (c.metadata as Record<string, unknown>) ?? undefined,
      })),
    );

    await this.pgVector.touchMetadata(
      input.organizationId,
      namespace,
      pieces.length,
    );

    const providerEnum = this.toPrismaProvider(this.provider.name);
    const usage = await this.aiRepo.recordUsage({
      organizationId: input.organizationId,
      userId: input.userId,
      kind: 'EMBEDDING',
      provider: providerEnum,
      model: embedResult.model,
      promptTokens: embedResult.usage.promptTokens,
      completionTokens: 0,
      totalTokens: embedResult.usage.totalTokens,
      latencyMs: embedResult.latencyMs,
    });
    if (embedResult.costUsd > 0) {
      await this.aiRepo.recordCost({
        organizationId: input.organizationId,
        usageId: usage.id,
        provider: providerEnum,
        model: embedResult.model,
        amountUsd: embedResult.costUsd,
        promptTokens: embedResult.usage.promptTokens,
        completionTokens: 0,
      });
    }

    return {
      documentId: doc.id,
      chunkCount: pieces.length,
      skipped: false,
      dimensions: embedResult.dimensions,
      model: embedResult.model,
    };
  }

  async embedBatch(inputs: EmbedEntityInput[]) {
    const results = [];
    for (const input of inputs) {
      results.push(await this.embedEntity(input));
    }
    return { count: results.length, results };
  }

  async rebuildNamespace(organizationId: string, namespace = 'default') {
    // Full corpus re-ingest is C006+; C1 refreshes namespace vector metadata.
    await this.pgVector.touchMetadata(organizationId, namespace, 0);
    return {
      organizationId,
      namespace,
      status: 'ok' as const,
      note: 'Namespace metadata refreshed; provide entity payloads via embed endpoints for full rebuild',
    };
  }

  private toPrismaProvider(name: ProviderName) {
    switch (name) {
      case 'openai':
        return 'OPENAI' as const;
      case 'azure_openai':
        return 'AZURE_OPENAI' as const;
      case 'anthropic':
        return 'ANTHROPIC' as const;
      case 'gemini':
        return 'GEMINI' as const;
      default:
        return 'MOCK' as const;
    }
  }
}
