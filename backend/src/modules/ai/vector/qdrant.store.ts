import { Injectable } from '@nestjs/common';
import {
  SimilaritySearchRequest,
  VectorHit,
  VectorRecord,
  VectorStore,
} from './vector.types';

/** Stub — configure QDRANT_URL in a later milestone. */
@Injectable()
export class QdrantVectorStore implements VectorStore {
  readonly name = 'qdrant';

  upsert(_records: VectorRecord[]): Promise<number> {
    return Promise.reject(
      new Error('Qdrant vector store is not configured (stub)'),
    );
  }

  deleteByEntity(): Promise<number> {
    return Promise.reject(
      new Error('Qdrant vector store is not configured (stub)'),
    );
  }

  similaritySearch(_request: SimilaritySearchRequest): Promise<VectorHit[]> {
    return Promise.reject(
      new Error('Qdrant vector store is not configured (stub)'),
    );
  }

  healthCheck(): Promise<'up' | 'down' | 'unconfigured' | 'degraded'> {
    return Promise.resolve('unconfigured');
  }
}
