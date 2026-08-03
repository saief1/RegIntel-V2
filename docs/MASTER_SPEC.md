# Master Specification

## Purpose

This document is the single source of truth for RegIntel's product, technical, and architectural specification. It should be read before making any significant change to the codebase. All other documents in `docs/` provide deeper detail on the areas summarized here.

## Table of Contents

- [1. Overview](#1-overview)
- [2. Release Status (v2.0.0)](#2-release-status-v200)
- [3. Goals & Non-Goals](#3-goals--non-goals)
- [4. Target Users & Personas](#4-target-users--personas)
- [5. System Architecture](#5-system-architecture)
- [6. Tech Stack](#6-tech-stack)
- [7. Core Domain Concepts](#7-core-domain-concepts)
- [8. Related Documents](#8-related-documents)
- [9. Open Questions](#9-open-questions)
- [10. Revision History](#10-revision-history)

## 1. Overview

RegIntel is an enterprise regulatory intelligence and compliance workspace. The UI helps compliance, risk, and operations teams navigate knowledge, work, investigations, AI assistance, reporting, governance, and commercial/ops surfaces with a calm, dense, trustworthy interface (Apple / Linear / Harvey-inspired).

At **v2.0.0**, RegIntel ships as a **Frontend Platform GA**: a complete, production-quality frontend with mock-backed domain modules. It demonstrates the product information architecture and interaction model ahead of real backend, AI orchestration, and wealth go-to-market phases.

## 2. Release Status (v2.0.0)

| Item | Status |
|---|---|
| Frontend Platform GA | ✅ v2.0.0 |
| Finished SaaS (auth, DB, live integrations, billing) | ❌ Future (Phases B–D) |
| Sprint numbering | **Stopped** after Sprint 20 |
| Next planning unit | Phases A–D in [`ROADMAP.md`](./ROADMAP.md) |

**Positioning statement for stakeholders:**  
*RegIntel v2.0.0 is Frontend Platform GA — not a finished SaaS.*

## 3. Goals & Non-Goals

### Goals

- Ship a coherent, accessible enterprise frontend platform
- Preserve module surfaces built in Sprints 1–19
- Keep design-system usage consistent (single Button/Badge/Card/Modal/Table paths)
- Document honest boundaries between demo platform and future backend/AI/commercial reality

### Non-Goals (v2.0.0)

- New business modules in Sprint 20
- Real authentication, persistence, or live third-party APIs
- Continuing Sprint 21+
- Wholesale redesign of completed pages

## 4. Target Users & Personas

Primary: compliance officers, AML investigators, policy owners, risk/reporting leads, and compliance ops admins at regulated financial institutions (wealth flagship first).

Secondary: auditors, partner implementers, developer platform consumers (API/SDK surfaces are mock/demo at GA).

## 5. System Architecture

See [`ARCHITECTURE.md`](./ARCHITECTURE.md) for the frontend platform diagram, layering, and GA vs future split.

High level today:

- **Client-only** React SPA
- **Mock domain state** via React context providers
- **Lazy routes** for feature pages
- **Design tokens** in CSS custom properties

Future: Backend Platform (Phase B), AI Intelligence Layer (Phase C), Wealth Launch (Phase D).

## 6. Tech Stack

| Layer | Technology | Notes |
|---|---|---|
| Frontend | React 19 + TypeScript + Vite | Confirmed |
| Routing | React Router 7 | Lazy + Suspense |
| Styling | CSS Modules + design tokens | `src/styles/tokens/` |
| Icons | lucide-react | Approved dependency |
| Classnames | clsx | Approved dependency |
| Backend | Not in GA | Phase B |
| Database | Not in GA | Phase B |
| Auth | Not in GA | Phase B |
| Hosting / Infra | Static SPA capable | See [`DEPLOYMENT.md`](./DEPLOYMENT.md) |
| E2E | Playwright | `e2e/smoke.spec.ts` |

Do not add dependencies without approval (`CLAUDE.md`).

## 7. Core Domain Concepts

Workspace concepts exercised in the UI (mock-backed):

- **Knowledge** — regulations, collections, policies, graph
- **Work** — tasks, cases, workflows, calendar
- **Investigations & regulatory change** — evidence, impact
- **AI Workspace** — chat, prompts, memory, agents (demo)
- **Reports / intelligence** — analytics, KPIs, board, benchmarks, command center
- **Governance & operations** — RBAC UI, audit, automation, system health, prod ops
- **Ecosystem & developer** — marketplace, lineage, twin, API explorer, webhooks
- **Adoption & commercial** — onboarding, success, billing/licensing mocks
- **Solutions** — wealth, banking, insurance, GRC packs (UI)

## 8. Related Documents

- [`PRODUCT.md`](./PRODUCT.md)
- [`ROADMAP.md`](./ROADMAP.md)
- [`ARCHITECTURE.md`](./ARCHITECTURE.md)
- [`RELEASE_NOTES.md`](./RELEASE_NOTES.md)
- [`FEATURES.md`](./FEATURES.md)
- [`DATABASE.md`](./DATABASE.md)
- [`API.md`](./API.md)
- [`UI_GUIDELINES.md`](./UI_GUIDELINES.md)
- [`SECURITY.md`](./SECURITY.md)
- [`DEPLOYMENT.md`](./DEPLOYMENT.md)
- [`DECISIONS.md`](./DECISIONS.md)
- [`CHANGELOG.md`](./CHANGELOG.md)

## 9. Open Questions

- Auth provider and tenancy model (Phase B)
- Persistence strategy and audit store (Phase B)
- Model hosting / RAG boundaries (Phase C)
- Wealth launch packaging and environments (Phase D)

## 10. Revision History

| Date | Author | Change |
|---|---|---|
| 2026-08-03 | Sprint 20 | Frontend Platform GA status; link ARCHITECTURE / RELEASE_NOTES / Phases A–D |
| TBD | TBD | Initial placeholder document created |
