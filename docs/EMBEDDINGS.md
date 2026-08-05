# Embeddings

## Purpose

Document/policy/regulation/task/conversation embedding pipeline for Milestone **C002**.

## Entity types

`DOCUMENT` · `POLICY` · `REGULATION` · `TASK` · `CONVERSATION` · `MESSAGE`

## Pipeline

1. **Chunk** — paragraph-aware chunker (`chunking.util.ts`) with max chars + overlap; SHA-256 content hash.
2. **Embed** — via active `AIProvider.embed` (mock deterministic 64-d vectors, or OpenAI `text-embedding-3-small`).
3. **Persist** — `embedding_documents` + `embedding_chunks` (JSON float arrays).
4. **Index** — upsert into `VectorStore`; update `vector_metadata`.

## Incremental updates

If `contentHash` matches an existing document and `force` is false, embed is skipped.

## API

| Method | Path | Description |
|---|---|---|
| POST | `/api/v1/ai/embeddings` | Embed/update one entity |
| POST | `/api/v1/ai/embeddings/batch` | Batch embed |
| POST | `/api/v1/ai/embeddings/rebuild` | Refresh namespace metadata (full corpus rebuild → C006+) |

## Config

- `AI_EMBEDDING_MODEL` (default `text-embedding-3-small`)
- Mock dimensions: **64** (tests without keys)

## Revision history

| Date | Change |
|---|---|
| 2026-08-05 | C002 Embeddings Platform |
