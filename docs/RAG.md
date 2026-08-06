# RAG Platform

## Purpose

Regulatory Intelligence RAG for Milestone **C2 (C006–C010)** / **v2.7.0**. Grounds AI Workspace answers in tenant-indexed knowledge with citations, confidence, and auditability.

## Status

✅ **RAG Platform complete** (`v2.7.0` / `RAG_PLATFORM_COMPLETE`).

Feature flags (all default **false**):

| Flag | Role |
|---|---|
| `USE_REAL_AI` / `VITE_USE_REAL_AI` | Real provider vs mock LLM |
| `USE_RAG` / `VITE_USE_RAG` | Gateway chat uses RagService |
| `USE_VECTOR_SEARCH` / `VITE_USE_VECTOR_SEARCH` | Enable vector cosine path in retrieval |

When flags are off, mock/local paths remain. Retrieval APIs still function for indexing/search testing; gateway chat skips full RAG unless `USE_RAG=true`.

## Pipeline

```
index (C006) → retrieve (C007) → prompt + LLM (C008) → citations (C009) → AI Workspace (C010)
```

## Module map

```
backend/src/modules/ai/
  indexing/     IndexingService — parse → chunk → metadata → embed → store
  retrieval/    RetrievalService — hybrid search + ranking
  rag/          RagService — ask() grounded answers
  citations/    CitationsService — source cards, export, workspace mapping
  rag.controller.ts
```

## Principles

1. Extends C001–C005 gateway/embeddings/vector — no foundation rewrite.
2. Tenant isolation via `organizationId` (+ optional `workspaceId`).
3. Prisma migrations only.
4. NestJS DI / SRP; controllers stay thin.
5. No frontend redesign — citations wire into existing AI Workspace components.

## Related

- [`RETRIEVAL.md`](./RETRIEVAL.md)
- [`CITATIONS.md`](./CITATIONS.md)
- [`AI_WORKSPACE.md`](./AI_WORKSPACE.md)
- [`VECTOR_SEARCH.md`](./VECTOR_SEARCH.md)
- [`AI_ARCHITECTURE.md`](./AI_ARCHITECTURE.md)

## Revision history

| Date | Change |
|---|---|
| 2026-08-05 | C006–C010 RAG Platform (v2.7.0) |
