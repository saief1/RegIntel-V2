import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../common/prisma/prisma.service';
import {
  SimilaritySearchRequest,
  VectorHit,
  VectorRecord,
  VectorStore,
  cosineSimilarity,
  keywordBoost,
} from './vector.types';

/**
 * Always-available vector store using JSON embeddings in Postgres.
 * Used when pgvector is unavailable or VECTOR_STORE=json.
 */
@Injectable()
export class JsonFallbackVectorStore implements VectorStore {
  readonly name = 'json';

  constructor(private readonly prisma: PrismaService) {}

  async upsert(records: VectorRecord[]): Promise<number> {
    let n = 0;
    for (const r of records) {
      await this.prisma.embeddingChunk.update({
        where: { id: r.id },
        data: {
          embedding: r.embedding,
          metadata: (r.metadata ?? undefined) as
            Prisma.InputJsonValue | undefined,
        },
      });
      n += 1;
    }
    return n;
  }

  async deleteByEntity(
    organizationId: string,
    namespace: string,
    entityType: string,
    entityId: string,
  ): Promise<number> {
    const result = await this.prisma.embeddingChunk.deleteMany({
      where: {
        organizationId,
        namespace,
        entityType: entityType as never,
        entityId,
      },
    });
    return result.count;
  }

  async similaritySearch(
    request: SimilaritySearchRequest,
  ): Promise<VectorHit[]> {
    const topK = request.topK ?? 8;
    const ns = request.filter.namespace ?? 'default';
    const rows = await this.prisma.embeddingChunk.findMany({
      where: {
        organizationId: request.filter.organizationId,
        namespace: ns,
        ...(request.filter.entityTypes?.length
          ? { entityType: { in: request.filter.entityTypes as never[] } }
          : {}),
        ...(request.filter.entityIds?.length
          ? { entityId: { in: request.filter.entityIds } }
          : {}),
        embedding: { not: Prisma.DbNull },
      },
      take: 500,
    });

    const scored: VectorHit[] = [];
    for (const row of rows) {
      const embedding = row.embedding as unknown as number[] | null;
      if (!Array.isArray(embedding) || !embedding.length) continue;
      const meta = (row.metadata ?? {}) as Record<string, unknown>;
      if (request.filter.metadataEquals) {
        let ok = true;
        for (const [k, v] of Object.entries(request.filter.metadataEquals)) {
          if (meta[k] !== v) {
            ok = false;
            break;
          }
        }
        if (!ok) continue;
      }
      const score =
        cosineSimilarity(request.vector, embedding) +
        keywordBoost(row.content, request.queryText);
      scored.push({
        id: row.id,
        score,
        entityType: row.entityType,
        entityId: row.entityId,
        chunkIndex: row.chunkIndex,
        content: row.content,
        metadata: meta,
      });
    }
    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, topK);
  }

  async healthCheck(): Promise<'up' | 'down' | 'unconfigured' | 'degraded'> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return 'up';
    } catch {
      return 'down';
    }
  }
}
