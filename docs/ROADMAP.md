# Roadmap

## Purpose

This document is the **contract for post-GA work**. It is the source of truth for agents and humans planning RegIntel after Frontend Platform GA.

**v2.0.0 = Frontend Platform GA — not a finished SaaS.**  
Sprint laddering **ends at Sprint 20**. Do **not** continue numbered sprints (no Sprint 21+). All further work uses **Phases A–F** and ticket IDs (`A001`–`F015`).

Ticket IDs in this document (and any linked phase checklists) are the planning source of truth for agents and humans.

## Table of Contents

- [1. Now](#1-now)
- [2. Product Board](#2-product-board)
- [3. Version Targets](#3-version-targets)
- [4. Tree](#4-tree)
- [5. Phase A — Platform Stabilization (A001–A010)](#5-phase-a--platform-stabilization-a001a010)
- [6. Phase B — Backend Platform (B000–B025)](#6-phase-b--backend-platform-b000b025)
- [7. Phase C — AI Intelligence Layer (C001–C020)](#7-phase-c--ai-intelligence-layer-c001c020)
- [8. Phase D — Wealth Management Production (D001–D020)](#8-phase-d--wealth-management-production-d001d020)
- [9. Phase E — Enterprise Integrations (E001–E015)](#9-phase-e--enterprise-integrations-e001e015)
- [10. Phase F — Pilot Customers (F001–F015)](#10-phase-f--pilot-customers-f001f015)
- [11. RegIntel v3.0 Commercial Launch](#11-regintel-v30-commercial-launch)
- [12. Out of Scope](#12-out-of-scope)
- [13. Revision History](#13-revision-history)

## 1. Now

**RegIntel v2.0.1 — Platform Stabilized** (Phase A complete, tags `v2.0.1` / `PHASE_A_COMPLETE`).

Ships as a production-ready **frontend platform**: shell, design system, routed module surfaces (Sprints 1–19), mock data, and enterprise UX patterns. It is **not** a finished SaaS — real auth, persistence, live integrations, AI orchestration, multi-tenancy, and billing remain Phases B–F / v3.0.

**Current step:** **B011+** (Org structure & isolation).  
Milestone **B2** (B006–B010) complete — **v2.2.0** / `B2_COMPLETE`.  
Milestone **B1** (B001–B005) complete — **v2.1.0**. Architecture Contract ✅.

**UI policy for Phase B:** UI is **frozen** except where backend integration requires minimal wiring (feature flags, API client, auth session). No redesigns, no new business modules.

## 2. Product Board

| Phase | Status | Progress |
|---|---|---|
| Frontend Platform GA (v2.0.0) | ✅ Complete | 100% |
| Phase A – Stabilization | ✅ Complete | 100% |
| Phase B – Backend Platform | 🔄 In Progress | ~40% (B000–B010 ✅; next B011+) |
| Phase C – AI Intelligence Layer | ⏳ Planned | 0% |
| Phase D – Wealth Management Production | ⏳ Planned | 0% |
| Phase E – Enterprise Integrations | ⏳ Planned | 0% |
| Phase F – Pilot Customers | ⏳ Planned | 0% |
| RegIntel v3.0 Commercial Launch | ⏳ Planned | 0% |

Update this board when a phase starts or completes. Optionally mirror status in [`PRODUCT_BOARD.md`](./PRODUCT_BOARD.md); **this table remains authoritative**.

## 3. Version Targets

| Version | Milestone |
|---|---|
| **v2.0.x** | Frontend Platform + Stabilization ✅ |
| **v2.1.0** | Backend Foundation (B001–B005) |
| **v2.2.0** | Identity & Access (B006–B010) ✅; Org structure B011–B015 continues |
| **v2.3.0** | Core Data Platform (B016–B020) |
| **v2.4.0** | API & Platform Services (B021–B025) |
| **v2.5.0** | Backend Platform Beta (Phase B exit) |
| **v2.7.0** | AI Intelligence Beta (Phase C) |
| **v2.9.0** | Wealth Management Beta (Phase D) |
| **v3.0.0** | Commercial GA (after Phases E–F) |

Do **not** tag `v2.1.0` until B001–B005 implementation is done. This planning PR does not bump the app version.

## 4. Tree

```
RegIntel v2.x Frontend Platform GA (v2.0.0)
→ Phase A Platform Stabilization (A001–A010) ✅ v2.0.1
→ Phase B Backend Platform (B000–B025) 🔄
    → B000 Architecture Contract (prerequisite)
    → B001–B005 Foundation → v2.1.0
    → B006–B010 Identity & access → v2.2.0 ✅
    → B011–B015 Org structure & isolation → next
    → B016–B020 Core Data Platform → v2.3.0
    → B021–B025 Platform Services → v2.4.0 / v2.5.0 beta
→ Phase C AI Intelligence Layer (C001–C020) → v2.7.0
→ Phase D Wealth Management Production (D001–D020) → v2.9.0
→ Phase E Enterprise Integrations (E001–E015)
→ Phase F Pilot Customers (F001–F015)
→ RegIntel v3.0 Commercial Launch
```

## 5. Phase A — Platform Stabilization (A001–A010)

**Status:** ✅ Complete (`v2.0.1`, `PHASE_A_COMPLETE`).

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

**Exit criteria:** lint/build/e2e green; Product Board Phase A complete; tagged `v2.0.1`. ✅

### A002 performance notes

See [`PERFORMANCE.md`](./PERFORMANCE.md). Routes are broadly lazy; shell entry chunk remains large — deferred provider/shell splits until Phase B.

## 6. Phase B — Backend Platform (B000–B025)

**Status:** 🔄 In Progress — B000–B010 ✅ (`v2.1.0`, `v2.2.0`); next **B011+**.

**Objective:** Introduce the real application backend and data plane. Replace mock providers with APIs over Postgres. No fake SaaS features in the frontend-only path.

**Contract:** [`BACKEND_ARCHITECTURE.md`](./BACKEND_ARCHITECTURE.md) (tech freeze: NestJS, PostgreSQL, Prisma, Redis, BullMQ, Swagger/OpenAPI, Docker Compose; JWT + Argon2; MFA/OIDC-ready later; canonical error/success envelopes; audit writer interface; `USE_REAL_*` flags; Prisma-only migrations).

### B000 — Architecture Contract (prerequisite) ✅

| ID | Title | Objective |
|---|---|---|
| **B000** | Backend Architecture Contract | Freeze stack and conventions; document B1 done criteria; update roadmap/version targets. **Complete.** |

### B1 Foundation → v2.1.0 (B001–B005) ✅

| ID | Title | Objective |
|---|---|---|
| **B001** | NestJS scaffolding | `backend/` app, Docker Compose (Postgres + Redis + API), health, config validation. ✅ |
| **B002** | Prisma schema foundation | Users, organizations, memberships, refresh tokens; migrations + local seed. ✅ |
| **B003** | Auth API | Login / logout / refresh; Argon2; JWT access + httpOnly refresh cookie. ✅ |
| **B004** | Users & organizations API | Current user, org create/list, membership basics, `X-Organization-Id` context. ✅ |
| **B005** | API foundation + OpenAPI | `/api/v1`, error shape, pagination, request IDs, Swagger, FE feature-flag stubs. ✅ |

**B1 done:** real users/orgs in PostgreSQL; auth; versioned REST + OpenAPI; flags ready for mock→API cutover. See contract §16.

### Identity & Organizations (B006–B015)

| IDs | Theme | Outline | Status |
|---|---|---|---|
| **B006–B010** | Identity & access | MFA, RBAC, Permissions, SSO (OIDC/SAML), SCIM | ✅ **v2.2.0** |
| **B011–B015** | Org structure & isolation | Workspaces, Teams, Departments, Invitations, Tenant isolation hardening | ⏳ next |

### Core Data Platform → v2.3.0 (B016–B020)

| IDs | Theme | Outline |
|---|---|---|
| **B016** | Knowledge API | Replace Knowledge mock provider behind flag |
| **B017** | Policies API | Replace Policies mock provider behind flag |
| **B018** | Tasks API | Replace Tasks mock provider behind flag |
| **B019** | Notifications API | Replace Notifications mock provider behind flag |
| **B020** | Cases API | Replace Cases mock provider behind flag |

### API & Platform Services → v2.4.0 / Backend Beta v2.5.0 (B021–B025)

| IDs | Theme | Outline |
|---|---|---|
| **B021** | Object storage | Evidence/attachments; signed URLs |
| **B022** | Background jobs | BullMQ workers, retries, dead-letter patterns |
| **B023** | Notification delivery | Real email/in-app delivery backed by events |
| **B024** | Audit log | Immutable audit trail for security-sensitive actions |
| **B025** | Multi-tenancy guarantees | Cross-tenant regression tests, ops runbooks → **v2.5.0 Backend Platform Beta** |

**Prerequisites from Phase A:** stable design system, certified frontend shell, documented API placeholders. ✅

**Exit criteria (Phase B):** authenticated multi-tenant API + Postgres; frontend can run against real backend in staging; first domain providers on API; security baseline per [`SECURITY.md`](./SECURITY.md); tag **v2.5.0**.

## 7. Phase C — AI Intelligence Layer (C001–C020)

**Objective:** Replace demo AI surfaces with orchestrated, auditable intelligence. **Version target:** v2.7.0.

| IDs | Theme | Outline |
|---|---|---|
| **C001–C005** | Model orchestration | Provider adapters, prompt governance, eval harness, cost/latency budgets |
| **C006–C010** | Retrieval | Tenant knowledge indexing, RAG pipelines, citation UX wired to real sources |
| **C011–C015** | Agents | Agent runtime, tool permissions, human-in-the-loop controls |
| **C016–C020** | Audit & safety | AI action audit trail, redaction, policy guardrails, incident playbooks |

## 8. Phase D — Wealth Management Production (D001–D020)

**Objective:** Productionize the wealth vertical on the real stack (not mock-only packs). **Version target:** v2.9.0.

| IDs | Theme | Outline |
|---|---|---|
| **D001–D005** | Wealth domain | KYC/CIRO/memo flows on live APIs; data model completion |
| **D006–D010** | Compliance workflows | Case→evidence→decision paths hardened for wealth ops |
| **D011–D015** | Packaging | Entitlements, feature flags, environment configs for wealth SKUs |
| **D016–D020** | Launch readiness | Ops, support runbooks, compliance evidence packs, UAT |

## 9. Phase E — Enterprise Integrations (E001–E015)

**Objective:** Connect RegIntel to customer enterprise systems with production-grade connectors.

| IDs | Theme | Outline |
|---|---|---|
| **E001–E005** | Core connectors | IdP/SCIM, ticketing, document stores — production paths |
| **E006–E010** | Data plane | Sync jobs, webhooks (live), lineage/observability for integrations |
| **E011–E015** | Partner / marketplace | Certified connector pack, sandbox, customer install UX |

## 10. Phase F — Pilot Customers (F001–F015)

**Objective:** Onboard pilot customers, gather feedback, harden for commercial scale.

| IDs | Theme | Outline |
|---|---|---|
| **F001–F005** | Pilot ops | Pilot contracts, environments, success criteria, feedback loops |
| **F006–F010** | Hardening | Defect triage from pilots, performance/SLO, support tooling |
| **F011–F015** | Commercial prep | Billing readiness, legal/security questionnaires, launch checklist → v3.0 |

## 11. RegIntel v3.0 Commercial Launch

Target after Phase F exit: multi-tenant SaaS with real auth, AI, wealth production pack, enterprise integrations, and pilot-proven ops. Exact scope and date TBD; track in Product Board. **Version target:** v3.0.0.

## 12. Out of Scope

- Continuing Sprint 21+ numbering
- Inventing fake backend / live SaaS features in the frontend-only codebase
- Expanding primary nav beyond 6 items without product approval
- Wholesale redesign of completed module pages during Phase A or B (UI frozen except integration wiring)
- Tagging v2.1.0 before B001–B005 implementation
- New npm dependencies without explicit approval (`CLAUDE.md`)

## 13. Revision History

| Date | Author | Change |
|---|---|---|
| 2026-08-03 | Milestone B2 | B006–B010 complete; tag v2.2.0 / B2_COMPLETE; current step → B011+ |
| 2026-08-03 | Milestone B1 | B001–B005 complete; tag v2.1.0; current step → B006+ |
| 2026-08-03 | Milestone B1 | Architecture Contract standards complete; Product Board → B1 in progress |
| 2026-08-03 | Phase B planning | B000 Backend Architecture Contract; reband B001–B025; version targets v2.1–v3.0; Phase B → In Progress (planning) |
| 2026-08-03 | Phase A | A001–A010 complete; Product Board Phase A ✅; tag v2.0.1 Platform Stabilized |
| 2026-08-03 | Phase A prep | Expand to Phases A–F + Product Board + ticket IDs (A001–F015); v3.0 launch milestone |
| 2026-08-03 | Sprint 20 | Frontend Platform GA; replace sprint ladder with Phases A–D |
| TBD | TBD | Initial placeholder document created |
