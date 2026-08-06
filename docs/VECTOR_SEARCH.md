# Vector Search

## Purpose

Vector database abstraction for Milestone **C003**.

## Interface

`VectorStore`: `upsert`, `deleteByEntity`, `similaritySearch`, `healthCheck`.

## Providers

| Name | Status |
|---|---|
| **pgvector** (default) | Implemented — uses JSON embeddings in Postgres; enables `CREATE EXTENSION vector` when available. Cosine similarity in-app (JSON canonical). |
| **json** | Explicit JSON cosine fallback store |
| **pinecone** | Stub — errors / `unconfigured` |
| **qdrant** | Stub — errors / `unconfigured` |

### Honesty note

Canonical storage is **JSON float arrays** on `embedding_chunks.embedding` so tests and environments without the pgvector package still pass. When the `vector` extension is present, health reports `up`; otherwise `degraded` with JSON search still functional. A dedicated `vector` column + ANN indexes can land in a later migration without API changes.

## Features

- Similarity search (cosine)
- Lightweight hybrid: keyword boost on `queryText`
- Metadata equality filter
- Namespace + `organizationId` tenant isolation
- Top-K ranking
- Re-index endpoint: `POST /api/v1/ai/vectors/reindex`
- Search endpoint: `POST /api/v1/ai/vectors/search`

## Config

`VECTOR_STORE=pgvector|json|pinecone|qdrant`

`USE_VECTOR_SEARCH` (default **false**) — when true, Retrieval Engine (C007) and gateway light-path use vector cosine; when false, keyword-only retrieval still works.

## C2 usage

RAG retrieval (`RetrievalService`) calls `VectorStore.similaritySearch` when the flag is on, then merges with keyword hits. Indexing continues to upsert into the configured store via `EmbeddingsService`.

## Revision history

| Date | Change |
|---|---|
| 2026-08-05 | C2 — `USE_VECTOR_SEARCH` gate for retrieval |
| 2026-08-05 | C003 Vector Database Layer |
