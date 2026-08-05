# AI Gateway

## Purpose

Unified orchestration for Milestone **C005**.

## Responsibilities

- Conversation create/list/get/delete
- Context building (prompt render + optional vector retrieval)
- Provider routing via DI (`AI_PROVIDER`)
- Retries (`AI_MAX_RETRIES`)
- Token/cost accounting (`ai_usage`, `ai_costs`)
- Persistence (`ai_conversations`, `ai_messages`)
- Provider/audit logs (`ai_provider_logs`)
- Health + in-process metrics

## Key endpoints

| Method | Path |
|---|---|
| GET | `/api/v1/ai/health` |
| GET | `/api/v1/ai/metrics` |
| GET/POST | `/api/v1/ai/conversations` |
| GET/DELETE | `/api/v1/ai/conversations/:id` |
| POST | `/api/v1/ai/chat` |
| GET | `/api/v1/ai/prompts` |

## Frontend wiring

When `VITE_USE_REAL_AI=true` (and real auth/org available), `CopilotProvider.appendExchange` calls `realAiApi.chat`. Default remains local mock (`VITE_USE_REAL_AI=false`). No visual redesign.

## Config

| Env | Default |
|---|---|
| `USE_REAL_AI` | `false` |
| `AI_PROVIDER` | `mock` |
| `AI_TIMEOUT_MS` | `30000` |
| `AI_MAX_RETRIES` | `2` |
| `AI_HISTORY_TOKEN_BUDGET` | `2500` |

## Revision history

| Date | Change |
|---|---|
| 2026-08-05 | C005 AI Gateway |
