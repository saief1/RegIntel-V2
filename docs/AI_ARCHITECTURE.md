# AI Architecture

## Purpose

Architecture for **Phase C — AI Intelligence Platform**, Milestone **C1 (C001–C005)** / **v2.6.0**. Establishes provider abstraction, embeddings, vector store, prompt orchestration, and a unified AI gateway without redesigning the frontend.

## Status

✅ **AI Foundation complete** (`v2.6.0` / `AI_FOUNDATION_COMPLETE`).  
`USE_REAL_AI` / `VITE_USE_REAL_AI` default **false** — mock path remains for tests and demos.

## Principles

1. **NestJS DI** — controllers call gateway/services; no provider-specific logic in controllers.
2. **Feature flags** — mock AI works without API keys; real OpenAI when flagged + keyed.
3. **Tenant isolation** — all AI rows scoped by `organizationId` (+ user for conversations).
4. **Prisma migrations only** — no ad-hoc schema drift.
5. **API under `/api/v1/ai/*`**.

## Module map

```
backend/src/modules/ai/
  providers/     AIProvider interface + mock/openai/azure/anthropic/gemini
  embeddings/    chunking + EmbeddingsService
  vector/        VectorStore + pgvector (JSON fallback) + pinecone/qdrant stubs
  prompts/       PromptManager + builtin templates
  gateway/       AiGatewayService (orchestration, usage, audit)
```

## Provider selection

| `USE_REAL_AI` | `AI_PROVIDER` | Result |
|---|---|---|
| false (default) | any / unset | **Mock** |
| true | `openai` (default when real) | OpenAI (fetch SDK-free) |
| true | `azure_openai` / `anthropic` / `gemini` | Interface impl; clear errors without keys |
| true | `mock` | Mock |

## Related docs

- [`EMBEDDINGS.md`](./EMBEDDINGS.md)
- [`VECTOR_SEARCH.md`](./VECTOR_SEARCH.md)
- [`PROMPTS.md`](./PROMPTS.md)
- [`AI_GATEWAY.md`](./AI_GATEWAY.md)
- [`API.md`](./API.md)

## New packages

None. OpenAI uses native `fetch`. Other providers are stubs/interfaces until keys + full SDKs are approved.

## Revision history

| Date | Change |
|---|---|
| 2026-08-05 | C001–C005 AI Foundation (v2.6.0) |
