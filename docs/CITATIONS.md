# Citations & Explainability

## Purpose

Milestone **C009** — inline citations, source cards, evidence chain, export.

## Citation record

Stored in `citations` with marker (`[1]`…), kind, title, href, snippet, chunk highlight offsets, content version, score/confidence, and `evidenceChain` JSON.

## APIs

| Method | Path | Description |
|---|---|---|
| GET | `/api/v1/ai/citations/query/:queryId` | List citations |
| GET | `/api/v1/ai/citations/:id/source` | Source card / preview |
| GET | `/api/v1/ai/citations/export/:queryId` | Export package |

## Frontend

When `VITE_USE_REAL_AI` (and optionally `VITE_USE_RAG`) is on, `CopilotProvider` maps API citations onto existing `AIChatMessage` / `CitationCard` / `ConfidenceBadge` — no redesign.

## Revision history

| Date | Change |
|---|---|
| 2026-08-05 | C009 Citation & Explainability |
