import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { JsonFallbackVectorStore } from './json-fallback.store';
import {
  SimilaritySearchRequest,
  VectorHit,
  VectorRecord,
  VectorStore,
  keywordBoost,
} from './vector.types';

/**
 * PgVector-backed store. Falls back to JSON cosine search when the
 * `vector` extension / column is unavailable.
 */
@Injectable()
export class PgVectorStore implements VectorStore {
  readonly name = 'pgvector';
  private readonly logger = new Logger(PgVectorStore.name);
  private pgvectorAvailable: boolean | null = null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly fallback: JsonFallbackVectorStore,
  ) {}

  private async detectPgvector(): Promise<boolean> {
    if (this.pgvectorAvailable !== null) return this.pgvectorAvailable;
    try {
      const rows = await this.prisma.$queryRaw<Array<{ exists: boolean }>>`
        SELECT EXISTS(
          SELECT 1 FROM pg_extension WHERE extname = 'vector'
        ) AS "exists"
      `;
      this.pgvectorAvailable = Boolean(rows[0]?.exists);
    } catch {
      this.pgvectorAvailable = false;
    }
    if (!this.pgvectorAvailable) {
      this.logger.warn(
        'pgvector extension not available; using JSON cosine fallback',
      );
    }
    return this.pgvectorAvailable;
  }

  async upsert(records: VectorRecord[]): Promise<number> {
    // Always persist JSON embeddings for portability / tests.
    return this.fallback.upsert(records);
  }

  async deleteByEntity(
    organizationId: string,
    namespace: string,
    entityType: string,
    entityId: string,
  ): Promise<number> {
    return this.fallback.deleteByEntity(
      organizationId,
      namespace,
      entityType,
      entityId,
    );
  }

  async similaritySearch(
    request: SimilaritySearchRequest,
  ): Promise<VectorHit[]> {
    const available = await this.detectPgvector();
    if (!available) {
      return this.fallback.similaritySearch(request);
    }

    // Prefer JSON path for C1 (canonical storage). Optionally use raw SQL
    // when a dedicated vector column is introduced in a later migration.
    // Documented in VECTOR_SEARCH.md — current search uses JSON cosine.
    try {
      const hits = await this.fallback.similaritySearch(request);
      if (request.queryText) {
        return hits.map((h) => ({
          ...h,
          score: h.score + keywordBoost(h.content, request.queryText),
        }));
      }
      return hits;
    } catch (err) {
      this.logger.warn(
        `pgvector path failed, using JSON fallback: ${String(err)}`,
      );
      return this.fallback.similaritySearch(request);
    }
  }

  async healthCheck(): Promise<'up' | 'down' | 'unconfigured' | 'degraded'> {
    const available = await this.detectPgvector();
    const json = await this.fallback.healthCheck();
    if (json === 'down') return 'down';
    return available ? 'up' : 'degraded';
  }

  /** Expose for re-index bookkeeping. */
  async touchMetadata(
    organizationId: string,
    namespace: string,
    chunkCount: number,
  ): Promise<void> {
    await this.prisma.vectorMetadata.upsert({
      where: {
        organizationId_namespace: { organizationId, namespace },
      },
      create: {
        organizationId,
        namespace,
        storeProvider: (await this.detectPgvector()) ? 'pgvector' : 'json',
        chunkCount,
        lastReindexAt: new Date(),
      },
      update: {
        chunkCount,
        lastReindexAt: new Date(),
        storeProvider: (await this.detectPgvector()) ? 'pgvector' : 'json',
        metadata: {
          note: 'JSON embeddings canonical; pgvector optional',
        },
      },
    });
  }
}
