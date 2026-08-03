# Roadmap

## Purpose

This document tracks RegIntel's development phases after Frontend Platform GA. **Sprint laddering ends at Sprint 20.** Further work is organized as Phases A–D — not Sprint 21+.

## Table of Contents

- [1. Now](#1-now)
- [2. Post-GA Phases](#2-post-ga-phases)
- [3. Milestones](#3-milestones)
- [4. Out of Scope](#4-out-of-scope)
- [5. Revision History](#5-revision-history)

## 1. Now

**RegIntel v2.0.0 — Frontend Platform GA** (Sprint 20 complete).

The product ships as a production-ready **frontend platform**: shell, design system, routed module surfaces (Sprints 1–19), mock data, and enterprise UX patterns. It is **not** a finished SaaS — real auth, persistence, live integrations, AI orchestration, and billing remain future work.

Do **not** continue numbered sprints (no Sprint 21+).

## 2. Post-GA Phases

### Phase A — Platform Stabilization

Harden what GA delivered without adding business modules.

- Design-token and component unification debt
- Accessibility and responsive polish at scale
- Test coverage expansion (unit + e2e critical paths)
- Performance budgets and bundle hygiene
- Documentation accuracy vs. running UI
- Defect triage from GA soak

### Phase B — Backend Platform

Introduce the real application backend and data plane.

- Authentication / authorization (SSO-ready)
- Persistence (tenant data, cases, policies, audit)
- API contracts replacing mock providers
- Environment/config, observability hooks
- Security baseline (see [`SECURITY.md`](./SECURITY.md))

### Phase C — AI Intelligence Layer

Replace demo AI surfaces with orchestrated intelligence.

- Real model orchestration and prompt governance
- Retrieval over tenant knowledge
- Agent runtime with human-in-the-loop controls
- Auditability of AI actions

### Phase D — Wealth Management Launch

Go-to-market verticalization on a real stack.

- Wealth pack productionization (KYC, CIRO, memos)
- Customer onboarding on live backend
- Commercial packaging tied to real billing
- Launch readiness (ops, support, compliance)

## 3. Milestones

| Milestone | Target | Status |
|---|---|---|
| Frontend Platform GA (v2.0.0) | 2026-08-03 | Complete |
| Phase A — Platform Stabilization | TBD | Next |
| Phase B — Backend Platform | TBD | Planned |
| Phase C — AI Intelligence Layer | TBD | Planned |
| Phase D — Wealth Management Launch | TBD | Planned |

## 4. Out of Scope

- Continuing Sprint 21+ numbering
- Inventing fake backend / live SaaS features in the frontend-only codebase
- Expanding primary nav beyond 6 items
- Wholesale redesign of completed module pages

## 5. Revision History

| Date | Author | Change |
|---|---|---|
| 2026-08-03 | Sprint 20 | Frontend Platform GA; replace sprint ladder with Phases A–D |
| TBD | TBD | Initial placeholder document created |
