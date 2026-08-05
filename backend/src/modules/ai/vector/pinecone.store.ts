import { Injectable } from '@nestjs/common';
import {
  SimilaritySearchRequest,
  VectorHit,
  VectorRecord,
  VectorStore,
} from './vector.types';

/** Stub — configure PINECONE_API_KEY in a later milestone. */
@Injectable()
export class PineconeVectorStore implements VectorStore {
  readonly name = 'pinecone';

  upsert(_records: VectorRecord[]): Promise<number> {
    return Promise.reject(
      new Error('Pinecone vector store is not configured (stub)'),
    );
  }

  deleteByEntity(): Promise<number> {
    return Promise.reject(
      new Error('Pinecone vector store is not configured (stub)'),
    );
  }

  similaritySearch(_request: SimilaritySearchRequest): Promise<VectorHit[]> {
    return Promise.reject(
      new Error('Pinecone vector store is not configured (stub)'),
    );
  }

  healthCheck(): Promise<'up' | 'down' | 'unconfigured' | 'degraded'> {
    return Promise.resolve('unconfigured');
  }
}
