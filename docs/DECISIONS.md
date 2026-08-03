# Decisions

## Purpose

This document is an Architecture Decision Record (ADR) log for RegIntel. Every significant technical or product decision — and its rationale, alternatives considered, and trade-offs — should be recorded here so future contributors understand *why* the system looks the way it does.

## Table of Contents

- [1. How to Use This Document](#1-how-to-use-this-document)
- [2. Decision Log](#2-decision-log)
- [3. Template](#3-template)

## 1. How to Use This Document

Append a new entry to the [Decision Log](#2-decision-log) for each notable decision, using the [template](#3-template) below. Do not delete superseded decisions — mark them as superseded and link to the replacement.

## 2. Decision Log

| ID | Date | Title | Status |
|---|---|---|---|
| ADR-001 | 2026-08-03 | Backend stack & `backend/` layout (Phase B) | Accepted |

### ADR-001: Backend stack & `backend/` layout (Phase B)

- **Date:** 2026-08-03
- **Status:** Accepted
- **Context:** Phase A complete; need a frozen backend contract before NestJS scaffolding (B001).
- **Decision:** NestJS + PostgreSQL + Prisma + Redis + BullMQ + Swagger + Docker Compose; JWT access (Bearer) + httpOnly refresh cookie; Argon2; place API in repo-root `backend/` without relocating the Vite frontend. Full detail: [`BACKEND_ARCHITECTURE.md`](./BACKEND_ARCHITECTURE.md).
- **Alternatives Considered:** `apps/api` monorepo layout; session-only cookies; alternative ORMs/frameworks.
- **Consequences:** B001+ must follow the contract; changing the freeze requires a superseding ADR.

## 3. Template

```
### ADR-XXX: <Title>

- **Date:** YYYY-MM-DD
- **Status:** Proposed | Accepted | Superseded | Rejected
- **Context:** Why is this decision needed?
- **Decision:** What was decided?
- **Alternatives Considered:** What else was evaluated?
- **Consequences:** What are the trade-offs / follow-up effects?
```
