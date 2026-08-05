export type VectorFilter = {
  organizationId: string;
  namespace?: string;
  entityTypes?: string[];
  entityIds?: string[];
  metadataEquals?: Record<string, string | number | boolean>;
};

export type VectorRecord = {
  id: string;
  organizationId: string;
  namespace: string;
  entityType: string;
  entityId: string;
  chunkIndex: number;
  content: string;
  embedding: number[];
  metadata?: Record<string, unknown>;
};

export type VectorHit = {
  id: string;
  score: number;
  entityType: string;
  entityId: string;
  chunkIndex: number;
  content: string;
  metadata?: Record<string, unknown>;
};

export type SimilaritySearchRequest = {
  vector: number[];
  topK?: number;
  filter: VectorFilter;
  /** Optional keyword for lightweight hybrid ranking. */
  queryText?: string;
};

export interface VectorStore {
  readonly name: string;
  upsert(records: VectorRecord[]): Promise<number>;
  deleteByEntity(
    organizationId: string,
    namespace: string,
    entityType: string,
    entityId: string,
  ): Promise<number>;
  similaritySearch(request: SimilaritySearchRequest): Promise<VectorHit[]>;
  healthCheck(): Promise<'up' | 'down' | 'unconfigured' | 'degraded'>;
}

export const VECTOR_STORE = Symbol('VECTOR_STORE');

export function cosineSimilarity(a: number[], b: number[]): number {
  const n = Math.min(a.length, b.length);
  if (n === 0) return 0;
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < n; i += 1) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  const denom = Math.sqrt(na) * Math.sqrt(nb);
  return denom === 0 ? 0 : dot / denom;
}

export function keywordBoost(content: string, queryText?: string): number {
  if (!queryText?.trim()) return 0;
  const hay = content.toLowerCase();
  const terms = queryText
    .toLowerCase()
    .split(/\s+/)
    .filter((t) => t.length > 2);
  if (!terms.length) return 0;
  let hits = 0;
  for (const t of terms) {
    if (hay.includes(t)) hits += 1;
  }
  return (hits / terms.length) * 0.15;
}
