# Prompts

## Purpose

Prompt orchestration for Milestone **C004**.

## Components

- **PromptManager** — render, version, budget history, audit logs
- Tables: `ai_prompts`, `ai_prompt_versions`
- Builtin seeds (system/workspace/role/agent/policy/report)

## Builtin keys

| Key | Kind |
|---|---|
| `system.default` | SYSTEM |
| `workspace.chat` | WORKSPACE |
| `role.compliance_officer` | ROLE |
| `agent.monitor` | AGENT |
| `policy.review` | POLICY |
| `report.executive` | REPORT |

## Features

- `{{variable}}` substitution
- Org overrides (org-scoped row wins over global)
- Conversation history token budgeting
- Version bump via `createVersion`
- Render audit → `ai_provider_logs` (`operation=prompt.render`)
- List: `GET /api/v1/ai/prompts`

## Streaming

Gateway streaming flag is accepted on the provider interface; C1 chat path is non-SSE request/response (UI keeps local typing delay). SSE can extend `POST /ai/chat` later without UI redesign.

## Revision history

| Date | Change |
|---|---|
| 2026-08-05 | C004 Prompt Orchestration |
