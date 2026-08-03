# Roadmap

## Purpose

This document is the **contract for post-GA work**. It is the source of truth for agents and humans planning RegIntel after Frontend Platform GA.

**v2.0.0 = Frontend Platform GA — not a finished SaaS.**  
Sprint laddering **ends at Sprint 20**. Do **not** continue numbered sprints (no Sprint 21+). All further work uses **Phases A–F** and ticket IDs (`A001`–`F015`).

Ticket IDs in this document (and any linked phase checklists) are the planning source of truth for agents and humans.

## Table of Contents

- [1. Now](#1-now)
- [2. Product Board](#2-product-board)
- [3. Tree](#3-tree)
- [4. Phase A — Platform Stabilization (A001–A010)](#4-phase-a--platform-stabilization-a001a010)
- [5. Phase B — Backend Platform (B001–B025)](#5-phase-b--backend-platform-b001b025)
- [6. Phase C — AI Intelligence Layer (C001–C020)](#6-phase-c--ai-intelligence-layer-c001c020)
- [7. Phase D — Wealth Management Production (D001–D020)](#7-phase-d--wealth-management-production-d001d020)
- [8. Phase E — Enterprise Integrations (E001–E015)](#8-phase-e--enterprise-integrations-e001e015)
- [9. Phase F — Pilot Customers (F001–F015)](#9-phase-f--pilot-customers-f001f015)
- [10. RegIntel v3.0 Commercial Launch](#10-regintel-v30-commercial-launch)
- [11. Out of Scope](#11-out-of-scope)
- [12. Revision History](#12-revision-history)

## 1. Now

**RegIntel v2.0.0 — Frontend Platform GA** (Sprint 20 complete, tags `v2.0.0` / `SPRINT20_COMPLETE`).

Ships as a production-ready **frontend platform**: shell, design system, routed module surfaces (Sprints 1–19), mock data, and enterprise UX patterns. It is **not** a finished SaaS — real auth, persistence, live integrations, AI orchestration, multi-tenancy, and billing remain Phases B–F / v3.0.

## 2. Product Board

| Phase | Status | Progress |
|---|---|---|
| Frontend Platform GA (v2.0.0) | ✅ Complete | 100% |
| Phase A – Stabilization | ⏳ Planned | 0% |
| Phase B – Backend Platform | ⏳ Planned | 0% |
| Phase C – AI Intelligence Layer | ⏳ Planned | 0% |
| Phase D – Wealth Management Production | ⏳ Planned | 0% |
| Phase E – Enterprise Integrations | ⏳ Planned | 0% |
| Phase F – Pilot Customers | ⏳ Planned | 0% |
| RegIntel v3.0 Commercial Launch | ⏳ Planned | 0% |

Update this board when a phase starts or completes. Optionally mirror status in [`PRODUCT_BOARD.md`](./PRODUCT_BOARD.md); **this table remains authoritative**.

## 3. Tree

```
RegIntel v2.x Frontend Platform GA (v2.0.0)
→ Phase A Platform Stabilization (A001–A010)
→ Phase B Backend Platform (B001–B025)
→ Phase C AI Intelligence Layer (C001–C020)
→ Phase D Wealth Management Production (D001–D020)
→ Phase E Enterprise Integrations (E001–E015)
→ Phase F Pilot Customers (F001–F015)
→ RegIntel v3.0 Commercial Launch
```

## 4. Phase A — Platform Stabilization (A001–A010)

**Objective:** Make every screen feel indistinguishable from a polished enterprise product. **Nothing new** — refinement only. No new business modules.

| ID | Title | Objective |
|---|---|---|
| **A001** | Enterprise Design Audit | Review key surfaces; standardize spacing/typography/border inconsistencies; remove one-off styling that breaks design tokens. |
| **A002** | Performance Audit | Bundle hygiene (code-splitting, dead imports); lazy-loading review; avoid unnecessary re-renders; no new deps. Document findings if large wins aren't possible in one pass. |
| **A003** | Accessibility | Keyboard, focus order, ARIA, contrast fixes on touched surfaces; forms/dialogs. |
| **A004** | Loading States | Standardize skeletons/empty/error via `EmptyState`, `Skeleton`, `NetworkErrorState`; close obvious gaps. |
| **A005** | Error Handling | Solidify `ErrorBoundary` / `NetworkErrorState` / 404 / 500 patterns; retry UX; polish. |
| **A006** | Responsive Audit | Extend Playwright viewport coverage if needed; fix overflow/clipping found. |
| **A007** | Component Library Audit | Document canonical Button/Badge/Card/Modal/Table/Input system in UI guidelines; remove or alias obvious duplicates if safe. |
| **A008** | Documentation Cleanup | Architecture, changelog note, roadmap progress, API placeholders, design-system pointers. |
| **A009** | Regression Certification | `npm run lint`, `npm run build`, `npx playwright test`. Fix failures. Optionally note a11y/perf in docs. |
| **A010** | Platform Release | Bump to **v2.0.1**, CHANGELOG + RELEASE_NOTES ("Platform Stabilized"), Product Board → Phase A ✅ 100%, tags `PHASE_A_COMPLETE` + `v2.0.1`. |

**Exit criteria:** lint/build/e2e green; Product Board Phase A complete; tagged `v2.0.1`.

### A002 performance notes (fill during Phase A)

- Document bundle/lazy-route findings and any deferred work here or in a short `docs/PERFORMANCE.md` if needed.

## 5. Phase B — Backend Platform (B001–B025)

**Objective:** Introduce the real application backend and data plane. Replace mock providers with APIs over Postgres. No fake SaaS features in the frontend-only path.

Suggested sequence (group weeks into ticket IDs as work is scheduled):

| IDs | Theme | Outline |
|---|---|---|
| **B001–B004** | Auth foundation | Identity provider integration, session/JWT strategy, login/logout/refresh, password/SSO-ready hooks |
| **B005–B007** | Organizations | Org model, membership, invites, org switcher wired to real tenancy |
| **B008–B010** | RBAC | Roles/permissions store, server enforcement, UI gating against live claims |
| **B011–B014** | Postgres + schema | Migrations, core entities (users, orgs, cases, policies, audit), environments |
| **B015–B018** | API layer | REST/OpenAPI contracts, replace mock providers, error/versioning conventions ([`API.md`](./API.md)) |
| **B019–B020** | Storage | Object/file storage for evidence/attachments; signed URLs |
| **B021–B022** | Jobs | Background workers, queues, retries for long-running tasks |
| **B023** | Notifications | Real notification delivery (email/in-app) backed by events |
| **B024** | Audit | Immutable audit log for security-sensitive actions |
| **B025** | Multi-tenancy | Tenant isolation guarantees, cross-tenant regression tests, ops runbooks |

**Prerequisites from Phase A:** stable design system, certified frontend shell, documented API placeholders.

**Exit criteria:** authenticated multi-tenant API + Postgres; frontend can run against real backend in a staging env; security baseline per [`SECURITY.md`](./SECURITY.md).

## 6. Phase C — AI Intelligence Layer (C001–C020)

**Objective:** Replace demo AI surfaces with orchestrated, auditable intelligence.

| IDs | Theme | Outline |
|---|---|---|
| **C001–C005** | Model orchestration | Provider adapters, prompt governance, eval harness, cost/latency budgets |
| **C006–C010** | Retrieval | Tenant knowledge indexing, RAG pipelines, citation UX wired to real sources |
| **C011–C015** | Agents | Agent runtime, tool permissions, human-in-the-loop controls |
| **C016–C020** | Audit & safety | AI action audit trail, redaction, policy guardrails, incident playbooks |

## 7. Phase D — Wealth Management Production (D001–D020)

**Objective:** Productionize the wealth vertical on the real stack (not mock-only packs).

| IDs | Theme | Outline |
|---|---|---|
| **D001–D005** | Wealth domain | KYC/CIRO/memo flows on live APIs; data model completion |
| **D006–D010** | Compliance workflows | Case→evidence→decision paths hardened for wealth ops |
| **D011–D015** | Packaging | Entitlements, feature flags, environment configs for wealth SKUs |
| **D016–D020** | Launch readiness | Ops, support runbooks, compliance evidence packs, UAT |

## 8. Phase E — Enterprise Integrations (E001–E015)

**Objective:** Connect RegIntel to customer enterprise systems with production-grade connectors.

| IDs | Theme | Outline |
|---|---|---|
| **E001–E005** | Core connectors | IdP/SCIM, ticketing, document stores — production paths |
| **E006–E010** | Data plane | Sync jobs, webhooks (live), lineage/observability for integrations |
| **E011–E015** | Partner / marketplace | Certified connector pack, sandbox, customer install UX |

## 9. Phase F — Pilot Customers (F001–F015)

**Objective:** Onboard pilot customers, gather feedback, harden for commercial scale.

| IDs | Theme | Outline |
|---|---|---|
| **F001–F005** | Pilot ops | Pilot contracts, environments, success criteria, feedback loops |
| **F006–F010** | Hardening | Defect triage from pilots, performance/SLO, support tooling |
| **F011–F015** | Commercial prep | Billing readiness, legal/security questionnaires, launch checklist → v3.0 |

## 10. RegIntel v3.0 Commercial Launch

Target after Phase F exit: multi-tenant SaaS with real auth, AI, wealth production pack, enterprise integrations, and pilot-proven ops. Exact scope and date TBD; track in Product Board.

## 11. Out of Scope

- Continuing Sprint 21+ numbering
- Inventing fake backend / live SaaS features in the frontend-only codebase
- Expanding primary nav beyond 6 items without product approval
- Wholesale redesign of completed module pages during Phase A
- New npm dependencies without explicit approval (`CLAUDE.md`)

## 12. Revision History

| Date | Author | Change |
|---|---|---|
| 2026-08-03 | Phase A prep | Expand to Phases A–F + Product Board + ticket IDs (A001–F015); v3.0 launch milestone |
| 2026-08-03 | Sprint 20 | Frontend Platform GA; replace sprint ladder with Phases A–D |
| TBD | TBD | Initial placeholder document created |
