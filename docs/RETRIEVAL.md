# Retrieval Engine

## Purpose

Milestone **C007** hybrid retrieval over tenant knowledge.

## Behavior

1. **Keyword / FTS-style** search on `embedding_chunks.content` (case-insensitive term contains).
2. **Vector cosine** when `USE_VECTOR_SEARCH=true` via `VectorStore.similaritySearch`.
3. Merge scores: vector × 0.7 + keyword boost + freshness.
4. Filters: tenant, namespace, workspace, entity types, doc types, metadata.
5. Similarity threshold (default `0.15`), top-K, duplicate reduction (≤2 chunks/entity).
6. Optional related docs (`knowledge_relationships`) and recommended policies.

## API

`POST /api/v1/ai/retrieve`

## Logging

Writes `retrieval_logs` and contributes to daily `retrieval_metrics`.

## Revision history

| Date | Change |
|---|---|
| 2026-08-05 | C007 Retrieval Engine |
