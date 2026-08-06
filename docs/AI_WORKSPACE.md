# AI Workspace Integration

## Purpose

Milestone **C010** — connect existing AI Workspace modes to RAG behind feature flags. No new pages or navigation.

## Modes → prompt keys

| Mode | Prompt key |
|---|---|
| chat / work / case | `workspace.chat` / RAG path |
| research / knowledge | `workspace.research` |
| document_analysis | `workspace.document_analysis` |
| compare | `workspace.compare` |
| drafting | `workspace.drafting` |
| executive_brief | `workspace.executive_brief` |
| board_report / report | `report.executive` |
| policy | `policy.review` |

When `USE_RAG=true`, `POST /api/v1/ai/chat` routes through `RagService.ask` (gateway → retrieval → prompt manager → embeddings/vector → LLM). When false, C1 mock/gateway path remains.

## Frontend flags

- `VITE_USE_REAL_AI` — call real gateway
- `VITE_USE_RAG` — expect RAG citation payload (wired when present)
- `VITE_USE_VECTOR_SEARCH` — reserved for future client-side retrieval UX (backend honors `USE_VECTOR_SEARCH`)

## Revision history

| Date | Change |
|---|---|
| 2026-08-05 | C010 AI Workspace Integration |
