# Changelog

## Purpose

This document tracks notable changes to RegIntel over time, following a format inspired by [Keep a Changelog](https://keepachangelog.com/). It should be updated alongside meaningful merges/releases.

## Table of Contents

- [1. Format](#1-format)
- [2. Unreleased](#2-unreleased)
- [3. Released Versions](#3-released-versions)

## 1. Format

Each entry should be categorized under one of: `Added`, `Changed`, `Deprecated`, `Removed`, `Fixed`, `Security`.

## 2. Unreleased

### Added

- None yet.

### Changed

- None yet.

### Fixed

- None yet.

## 3. Released Versions

| Version | Date | Summary |
|---|---|---|
| 2.5.0 | 2026-08-05 | Backend GA — deployment, observability, security hardening, CI/CD, certification (Milestone B5) |
| 2.4.0 | 2026-08-04 | Infrastructure & Production Readiness — email, immutable audit, search, multi-tenancy, ops (Milestone B4) |
| 2.3.0 | 2026-08-04 | Data Layer & Notifications — Prisma domain models, repos, storage, BullMQ, notification APIs (Milestone B3) |
| 2.2.1 | 2026-08-04 | Identity & Sessions Completeness — sessions, trusted devices, Security Center APIs |
| 2.2.0 | 2026-08-03 | Identity & Access — MFA, RBAC, Permissions, SSO, SCIM (Milestone B2) |
| 2.1.0 | 2026-08-03 | Backend Foundation — NestJS/Prisma/auth/orgs, OpenAPI, feature-flag stubs (Milestone B1) |
| 2.0.1 | 2026-08-03 | Platform Stabilized — Phase A polish (design, a11y, loading/error, docs) |
| 2.0.0 | 2026-08-03 | Frontend Platform GA — hardening, error boundary, docs, no new modules |
| 1.9.0-beta | 2026-08-03 | Commercial Platform — billing, customer portal, partners, usage, licensing |
| 1.8.0-beta | 2026-08-03 | Customer Experience — onboarding, help, success, tours, community |
| 1.7.0-beta | 2026-08-03 | Industry Solutions — wealth flagship, banking, insurance, GRC marketplace |
| 1.6.0-beta | 2026-08-03 | Production Operations — ops center, incidents, backups, deploys, observability |
| 1.5.0-beta | 2026-08-03 | Developer Platform — portal, API explorer, apps, webhooks, SDKs |
| 1.3.0-beta | 2026-08-03 | Connected Ecosystem — marketplace, workflow canvas, lineage, twin |
| 1.2.0-beta | 2026-08-03 | Enterprise Operations — data, security, audit, automation, health |
| 1.1.0-beta | 2026-08-03 | Enterprise Intelligence — analytics, KPIs, board, benchmarks |
| 1.0.0-beta | 2026-08-03 | Autonomous Compliance — AI workforce, queue, knowledge graph |
| 0.9.0 | 2026-08-02 | Connected Enterprise — integrations, API platform, AI agents |
| 0.8.0 | 2026-08-02 | Enterprise Governance — policy lifecycle, workflows, RBAC |
| 0.7.0 | 2026-08-02 | Execution Platform — AI → Work Action Center |



### v2.5.0 — Backend GA (Milestone B5)

**Status:** Minor (Phase B / B021–B025)  
**Tags:** `v2.5.0`, `BACKEND_GA_COMPLETE`  
**Date:** 2026-08-05

#### Added

- Deployment platform: config checksum, secret validation, build/deployment metadata endpoints, prod Compose overlay, non-root Docker ([`DEPLOYMENT.md`](./DEPLOYMENT.md))
- Observability extensions: correlation IDs, response timing, error aggregation, `/ops/dashboard|errors|diagnostics` ([`OPERATIONS.md`](./OPERATIONS.md))
- Security hardening: headers, global rate limit, password policy, API key hashing, `/security/hardening` ([`SECURITY.md`](./SECURITY.md))
- CI/CD: `.github/workflows/ci.yml`, `release.yml`, `deploy-placeholder.yml`
- Backend GA readiness report ([`BACKEND_GA.md`](./BACKEND_GA.md))

#### Changed

- Health/version surfaces report `2.5.0`
- Phase B marked complete; next is Phase C (not started)
- Roadmap remaps B021–B025 to Backend GA (deploy/obs/security/CI/certification)

#### Security

- Production hard-fails on weak JWT/MFA secrets or `COOKIE_SECURE=false`

---

### v2.4.0 — Infrastructure & Production Readiness (Milestone B4)

**Status:** Minor (Phase B / B016–B020)  
**Tags:** `v2.4.0`, `MILESTONE_B4_COMPLETE`  
**Date:** 2026-08-04

#### Added

- Email platform: Console/SMTP/Resend/SendGrid/SES providers, system templates, delivery log, webhooks placeholder ([`EMAIL.md`](./EMAIL.md))
- Immutable `audit_logs` (+ hash chain, DB immutability triggers), `audit_exports`, retention/export APIs ([`AUDIT.md`](./AUDIT.md))
- Search platform: `search_documents`, rebuild/incremental BullMQ job, Search API with highlighting ([`SEARCH.md`](./SEARCH.md))
- Multi-tenancy: `tenant_limits`, `tenant_usage`, `rate_limits`, `feature_flags`; quotas + RPM middleware ([`MULTITENANCY.md`](./MULTITENANCY.md))
- Ops: `/liveness`, `/readiness`, `/metrics`, `/ops/env`, structured logging, OTel stubs, graceful shutdown ([`OPERATIONS.md`](./OPERATIONS.md))
- Flags: `USE_REAL_EMAIL`, `USE_REAL_AUDIT`, `USE_REAL_SEARCH` (+ `VITE_` counterparts, default false)
- Audit Center wires platform audit log panel when `VITE_USE_REAL_AUDIT=true` (no new screens)

#### Changed

- Health check expands dependency matrix (DB, Redis, queue, storage, email) and reports `version: 2.4.0`
- Roadmap remaps B016–B020 to Infrastructure & Production Readiness (search + ops replace prior org/workflow-only draft)

---

### v2.3.0 — Data Layer & Notifications (Milestone B3)

**Status:** Minor (Phase B / B011–B015)  
**Tags:** `v2.3.0`, `MILESTONE_B3_COMPLETE`  
**Date:** 2026-08-04

#### Added

- Domain Prisma models: policies, policy_versions, documents, tasks, cases, notifications, notification_preferences, reports, workflows, storage_objects, attachments, audit_entries, activity_stream
- Repository layer (interfaces + Prisma implementations); Nest modules wire controllers → services → repositories
- Object storage abstraction with Local provider (S3/Azure/GCS stubs fall back to Local); see [`STORAGE.md`](./STORAGE.md)
- BullMQ queues/workers: email, reminder, review-cycle, policy-expiry, notification-delivery, sync-retry, workflow-automation, audit-cleanup; `/api/v1/jobs/stats`
- Notification APIs: list, create, preferences, bulk read, mark-all-read, archive; email delivery enqueued
- Domain CRUD under `/api/v1`: policies, tasks, cases, knowledge, reports, workflows, audit-entries, storage
- Feature flags `USE_REAL_*` / `VITE_USE_REAL_*` (default false); FE notifications wired when `VITE_USE_REAL_NOTIFICATIONS=true`
- Env: `DATABASE_URL`, `DIRECT_URL`, `STORAGE_PROVIDER`, `STORAGE_LOCAL_ROOT`

#### Changed

- Health check reports database, redis/queue, and storage provider
- Audit writer dual-writes `security_events` + `audit_entries`
- Roadmap remaps B016–B020 to platform deepening (email, immutable audit, org structure, workflows, tenancy)

---

### v2.2.1 — Identity & Sessions Completeness

**Status:** Patch (Phase B / B2 gap-fill)  
**Tags:** `v2.2.1`, `B2_SESSIONS_COMPLETE`  
**Date:** 2026-08-04

Gap-fill on top of shipped **v2.2.0** / `B2_COMPLETE`. Does **not** retag v2.2.0. Adds session management, MFA trusted devices, Security Center backend APIs, role aliases, and feature-flag completeness. No new screens; existing Security Center / Admin Console wire when `VITE_USE_REAL_AUTH=true`.

#### Gap audit (prompt B006–B010 vs shipped)

| Capability | v2.2.0 | v2.2.1 |
|---|---|---|
| MFA TOTP + recovery | ✅ | ✅ + remember browser / trusted devices |
| DB RBAC + permissions | ✅ | ✅ + Owner/Administrator/Reviewer/Employee/Guest aliases |
| SSO mock OIDC/SAML | ✅ | unchanged |
| SCIM REST | ✅ (was prompt “B009”) | unchanged |
| Session management (list/revoke/logout-all/idle) | ❌ (refresh only) | ✅ |
| Security Center backend | ❌ | ✅ devices, sessions, events, login/password history, audit query |
| Security Center UI | mock page ✅ | wired behind `VITE_USE_REAL_AUTH` (no new screens) |
| `USE_REAL_ORGS` / `USE_REAL_STORAGE` flags | ❌ | ✅ (default false) |

#### Added

- Session APIs: `GET/DELETE /sessions`, `POST /sessions/logout-everywhere`, `GET /sessions/policy`
- Security APIs: devices, login-history, failed-logins, events, audit-trail, password-history, change password
- Trusted devices + MFA `rememberBrowser`; idle timeout on refresh
- Persisted `security_events` / `login_attempts` / `password_history` / `trusted_devices`
- `AuthSessionProvider` + `realSecurityApi`; flags `VITE_USE_REAL_ORGS`, `VITE_USE_REAL_STORAGE`
- Roles: `REVIEWER`, `EMPLOYEE`, `GUEST`; ORG_ADMIN display “Administrator” (aliases Owner)

#### Changed

- Roadmap/Product Board: v2.2.1 noted; B011–B015 remain org structure (user “data layer” ask mapped to B016–B022 sequence, not renumbered)
- `package.json` / backend → `2.2.1`

### v2.2.0 — Identity & Access (Milestone B2)

**Status:** Minor (Phase B / B006–B010)  
**Tags:** `v2.2.0`, `B2_COMPLETE`  
**Date:** 2026-08-03

Ships identity & access management on the NestJS foundation: TOTP MFA with recovery codes, database-driven RBAC + permission grants, SSO OIDC/SAML configuration interfaces (mock providers), and SCIM 2.0-style provisioning REST. Frontend stays mock-default; minimal `/settings/security/sso` page added.

#### Added

- MFA endpoints (`/mfa/*`, `/auth/mfa/verify`) with encrypted TOTP secrets + recovery codes
- RBAC catalog/matrix + member role assignment; `PermissionsGuard` / `@RequirePermissions`
- Effective permissions API + org/team/resource grants
- SSO configuration CRUD/enable + mock authorize/callback
- SCIM configuration, Users/Groups, mappings, sync status
- Prisma migration `identity_access_b2`; seed roles/permissions + mock SSO configs
- Feature flags `VITE_USE_REAL_RBAC|MFA|SSO|SCIM` (default false)

#### Changed

- Memberships gain `app_role` (AppRole); users gain `is_super_admin`, `active`, `external_id`
- Login returns MFA challenge when enrolled
- Product Board / Roadmap: B006–B010 ✅; current step → B011+
- `package.json` / backend version → `2.2.0`

### v2.1.0 — Backend Foundation (Milestone B1)

**Status:** Minor (Phase B / B001–B005)  
**Tags:** `v2.1.0`, `MILESTONE_B1_COMPLETE`  
**Date:** 2026-08-03

Ships the NestJS backend foundation: Postgres + Prisma, JWT/Argon2 auth, users/orgs multi-tenancy, OpenAPI, Docker Compose, and frontend `VITE_USE_REAL_*` flags (default mock). UI unchanged except flag/API client stubs.

#### Added

- `backend/` NestJS API + root `docker-compose.yml` (Postgres, Redis, API)
- Prisma models/migrations/seed for users, organizations, memberships, refresh tokens
- Auth routes: register (gated), login, logout, refresh; MFA/OIDC/SAML stubs
- `/api/v1` users/me + organizations; Swagger at `/api/docs`
- Canonical envelopes (`success`/`requestId`); `AuditWriter` stub
- Frontend feature flags + `apiClient` / `realAuthApi` stubs

#### Changed

- Architecture Contract standards complete (errors, audit, flags, migrations, release discipline)
- Product Board: B000 ✅, B001–B005 ✅; current step → B006+
- `package.json` / `backend` version → `2.1.0`

### v2.0.1 — Platform Stabilized

**Status:** Patch (Phase A complete)  
**Tags:** `v2.0.1`, `PHASE_A_COMPLETE`  
**Date:** 2026-08-03

Phase A (A001–A010) refinement only — no new business modules. Enterprise polish across design tokens, accessibility, empty/error patterns, responsive/e2e coverage, and documentation. Product Board: Phase A ✅ 100%. Next: Phase B Backend Platform.

#### Added

- `docs/PERFORMANCE.md` (A002 findings)
- `docs/PRODUCT_BOARD.md` mirror of roadmap board
- Playwright coverage for notifications dialog + cases `aria-sort`

#### Changed

- WhatsNew uses canonical `Modal` (removed one-off dialog chrome)
- Notifications panel uses `Dropdown` `panelRole="dialog"` + `EmptyState`
- Tokenized spacing/focus on Work, Cases, AI, governance, connected hub surfaces
- Lazy `NotFoundPage` / `ComingSoonPage`
- `EmptyState` supports configurable `role`; `NetworkErrorState` uses `alert`
- Roadmap / Product Board → Phases A–F; Phase A marked complete
- `package.json` version → `2.0.1`

#### Fixed

- Focus trap fallback when dialogs have no focusable children
- Cases table sort announcements (`aria-sort` + button labels)
- Settings audit trail empty state when filters match nothing

### v2.0.0 — Frontend Platform GA

**Status:** GA (Frontend Platform)  
**Sprint:** 20 (`SPRINT20_COMPLETE`, `v2.0.0`)  
**Date:** 2026-08-03

Release Candidate / GA hardening sprint. **No new business modules.** v2.0.0 is the Frontend Platform GA — **not** a finished SaaS (real auth, persistence, live integrations, AI orchestration, and billing remain Phases B–F / v3.0). Sprint numbering stops here; next work is Phases A–F.

#### Added

- Global React `ErrorBoundary` with “Something went wrong” recovery UI
- Reusable `NetworkErrorState` (demoed on Integrations error connectors)
- `docs/ARCHITECTURE.md` and `docs/RELEASE_NOTES.md`
- Playwright coverage for unknown-route / Not Found recovery

#### Changed

- Knowledge routes converted to lazy + `Suspense` (consistent with other features)
- EmptyState gains `role="status"` and decorative icon `aria-hidden`
- Workspace initial load announces via `role="status"`
- Not Found uses design-system `Button` for recovery
- `package.json` version → `2.0.0`
- Roadmap reframed to Phases A–D (no Sprint 21+)
- Master Spec / UI Guidelines updated for Frontend Platform GA

#### Fixed

- Integration detail labels no longer use bare `<label>` without controls (a11y)

### v1.9.0-beta — Commercial Platform

**Status:** Beta  
**Sprint:** 19 (`SPRINT19_COMPLETE`)  
**Date:** 2026-08-03

RegIntel gains billing & subscription management, customer and partner portals, usage analytics, and enterprise licensing — with trial countdown, usage warnings, and plan-aware feature flags (mock).

#### Highlights

##### Billing & Subscription Center (P091)

- `/settings/billing` current plan, trial/renewal, usage meters, plan comparison, payment methods, invoices, cost breakdown

##### Customer Portal (P092)

- `/customer` org profile, contracts, CSM, tickets, training, health score, QBR, renewal readiness

##### Partner Portal (P093)

- `/partners` consulting/implementation/technology/marketplace directory, deals, certifications, revenue

##### Usage & Consumption Analytics (P094)

- `/settings/usage` AI/API/storage trends, top users, feature adoption, department usage, CSV export

##### Enterprise Licensing (P095)

- `/settings/licensing` seat assign/revoke/transfer, entitlements, modules, environments, trial licenses

### v1.8.0-beta — Customer Experience, Onboarding & Adoption

**Status:** Beta  
**Sprint:** 18 (`SPRINT18_COMPLETE`)  
**Date:** 2026-08-03

RegIntel gains self-serve onboarding, learning, customer success coaching, product tours, and community feedback loops.

#### Highlights

##### Guided Onboarding (P086)

- `/onboarding` 8-step wizard with progress, skip, save, checklist, and time estimates

##### Learning Center (P087)

- `/help` searchable docs, tours, academies, API docs, release notes, bookmarks

##### Customer Success (P088)

- `/customer-success` adoption metrics, checklist, recommendations, milestones, QBR summary

##### Product Tours (P089)

- `/settings/tours` first-login and area tours with coach marks and restart

##### Feedback & Community (P090)

- `/community` feature requests, roadmap, known issues, votes, submit/export feedback

### v1.7.0-beta — Industry Solution Packs

**Status:** Beta  
**Sprint:** 17 (`SPRINT17_COMPLETE`)  
**Date:** 2026-08-03

RegIntel becomes industry-aware with a solution marketplace and dedicated packs. Wealth Management (Canada) is the flagship.

#### Highlights

##### Solution Marketplace (P085)

- `/solutions` install/preview cards across wealth, banking, insurance, GRC, and adjacent verticals

##### Wealth Management Pack (P081) — Flagship

- `/solutions/wealth` CIRO/CSA/FINTRAC/OBSI dashboards, KYC, suitability, branch supervision, AI templates

##### Banking Pack (P082)

- `/solutions/banking` AML/sanctions modules with regulatory health and risk heatmap

##### Insurance Pack (P083)

- `/solutions/insurance` agent supervision, review calendar, AI policy review

##### Enterprise GRC Pack (P084)

- `/solutions/grc` risk matrix, control coverage, audit universe, control testing

### v1.6.0-beta — Production Operations

**Status:** Beta  
**Sprint:** 16 (`SPRINT16_COMPLETE`)  
**Date:** 2026-08-03

RegIntel gains production SaaS operations: monitoring, incidents, backups/DR, deployments, and observability.

#### Highlights

##### Operations Center (P076)

- `/operations` dashboard with health cards, dependency map, jobs, maintenance views

##### Incident Management (P077)

- `/operations/incidents` severity/lifecycle, timeline, AI summary, status page preview

##### Backup & DR (P078)

- `/operations/backups` backup kinds, restore/verify, RPO/RTO, restore simulation

##### Deployment Center (P079)

- `/operations/deployments` environments, checklist, rollback, feature flags

##### Observability (P080)

- `/operations/observability` metrics, logs, traces, alert silence windows

### v1.5.0-beta — Developer Platform & Public APIs

**Status:** Beta  
**Sprint:** 15 (`SPRINT15_COMPLETE`)  
**Date:** 2026-08-03

RegIntel becomes an extensible platform with a public developer experience: portal, API explorer, credentials, webhooks, and SDKs.

#### Highlights

##### Developer Portal (P071)

- `/developer` dashboard with API health, usage cards, request history, and changelog

##### Public API Explorer (P072)

- `/developer/api` Stripe-style docs with categories, version selector, examples, and mock playground

##### API Keys & OAuth Apps (P073)

- `/developer/apps` live/sandbox keys with rotate/revoke plus OAuth app registration

##### Webhooks Center (P074)

- `/developer/webhooks` event catalog, delivery log, payload viewer, replay

##### SDK & Resources (P075)

- `/developer/sdk` multi-language SDKs, CLI, sample projects, Postman collection

### v1.3.0-beta — Enterprise Integrations & Workflow Ecosystem

**Status:** Beta  
**Sprint:** 13 (`SPRINT13_COMPLETE`)  
**Date:** 2026-08-03

RegIntel becomes the hub connecting identity, productivity, ticketing, storage, and compliance systems with lineage and organizational simulation.

#### Highlights

##### Integration Marketplace (P061)

- `/integrations/marketplace` with category browse, install/enable/disable, config, sync history

##### Integration Builder (P062)

- `/integrations/builder` for REST/GraphQL/webhook/scheduled sync pipelines (mock)

##### Workflow Studio 2.0 (P063)

- `/automation/canvas` visual canvas with zoom/pan, validation, publish, rollback

##### Data Lineage (P064)

- `/data/lineage` regulation→report graph with impact analysis and list fallback

##### Executive Digital Twin (P065)

- `/reports/digital-twin` organization map, simulations, forecast impact

### v1.2.0-beta — Enterprise Platform & Production Readiness

**Status:** Beta  
**Sprint:** 12 (`SPRINT12_COMPLETE`)  
**Date:** 2026-08-03

RegIntel gains the operational platform capabilities CIOs, CISOs, and compliance teams expect before deployment.

#### Highlights

##### Data Management Center (P056)

- `/settings/data` with sources, import/export/archive/restore jobs, quality, retention, duplicates

##### Enterprise Security Center (P057)

- `/settings/security` with alerts, sessions, devices, IP restrictions, secrets, risk scoring

##### Audit & Compliance Center (P058)

- `/audit` with lifecycle visualization, findings, evidence requests, external auditor portal (mock)

##### Automation Studio (P059)

- `/automation` no-code builder, templates, run history, retries

##### System Health Center (P060)

- `/system` service health, queues, feature flags, release notes, maintenance mode

##### Cross-cutting

- Toast center, system announcements, global job queue, operations search index

### v1.1.0-beta — Enterprise Intelligence & Analytics

**Status:** Beta  
**Sprint:** 11 (`SPRINT11_COMPLETE`)  
**Date:** 2026-08-03

RegIntel strengthens the executive layer so CCOs, CROs, and boards can understand compliance posture with analytics, forecasts, and board-ready packages.

#### Highlights

##### Executive Analytics Center (P051)

- `/reports/analytics` with compliance score, risk heatmap, department performance, trends
- Date ranges, business unit filters, saved/shared/favorite views, export queue

##### KPI Builder (P052)

- Custom KPIs with metric composition, formulas, thresholds, alerts, goals, trends

##### Predictive Compliance (P053)

- Workload, audit, department risk, resource, deadline, policy, and agent forecasts
- Confidence, reasoning, and suggested mitigation on each prediction

##### Board Reporting Studio (P054)

- `/reports/board` with rearrangeable sections, templates, package generation, version history

##### Enterprise Benchmarking (P055)

- `/reports/benchmark` leaderboards, SVG radar + accessible table, improvement opportunities

### v1.0.0-beta — Autonomous AI Compliance Platform

**Status:** Beta  
**Sprint:** 10 (`SPRINT10_COMPLETE`)  
**Date:** 2026-08-03

RegIntel moves from AI assistant to AI workforce — autonomous agents that monitor, analyze, recommend, assign, and track compliance work under human supervision.

#### Highlights

##### AI Agent Workspace (P046)

- Top-level `/agents` workforce with 10 autonomous specialists
- Status, health, confidence, queue, current job, schedule
- Pause / Resume / Run Now / View History
- Explainability, logs, retries, activity timeline

##### Agent Builder (P047)

- Custom agent configuration (trigger, sources, systems, output, approvals, schedule)
- Visual workflow: Trigger → Collect → Analyze → Decision → Create Tasks → Notify → Complete

##### Autonomous Work Queue (P048)

- Central queue with New → Completed/Failed states
- Priority, confidence, estimates, linked regulation/policy, bulk approve/reject

##### Knowledge Graph (P049)

- Interactive SVG graph with zoom, filter, search, detail panel
- Accessible list fallback

##### Executive AI Command Center (P050)

- Risk, health, critical issues, agent activity, forecasts, bottlenecks
- Daily / weekly / monthly AI briefs with regenerate

### v0.9.0 — Connected Enterprise Platform

**Status:** Stable  
**Sprint:** 9 (`SPRINT9_COMPLETE`)  
**Date:** 2026-08-02

RegIntel becomes the compliance command center for the enterprise stack — integrations, developer APIs, continuous AI monitoring, collaboration, and admin controls.

#### Highlights

##### Integration Hub (P041)

- Settings Integrations area plus `/integrations`
- Sixteen mock connectors (M365, Outlook, SharePoint, Teams, Jira, ServiceNow, Slack, Confluence, OneDrive, Google Workspace, GitHub, Box, AWS S3, Azure Blob, Generic REST, Webhooks)
- Status, health, owner, permissions, sync frequency, activity log, disconnect/reconnect
- Background sync queue with retry UI, error history, global activity stream

##### API Platform (P042)

- API keys, OAuth clients, webhooks, event logs
- Usage & rate limits, documentation viewer, test console

##### Continuous AI Monitoring (P043)

- Agents for FINTRAC, CIRO, CSA, OSFI, SEC, FINRA, FCA, ESMA
- Last scan, publications, impact, confidence, actions, generated tasks
- Agent health dashboard

##### Notifications & Collaboration (P044)

- Mentions, channels, announcement banners, digests, watchlists
- Expanded notification feed with approval reminders

##### Enterprise Administration (P045)

- Admin Console: tenant, users, teams/departments, SSO/SAML/SCIM (mock)
- Sessions, MFA, password/security policies, login history

### v0.8.0 — Enterprise Governance

**Status:** Stable  
**Sprint:** 8 (`SPRINT8_COMPLETE`)  
**Date:** 2026-08-02

RegIntel evolves from an AI-powered compliance execution platform into a full enterprise GRC operating system.

#### Highlights

##### Enterprise Governance

- Policy Workspace
- Policy lifecycle
- Version history
- Side-by-side policy comparison
- Digital sign-off
- AI Policy Assistant

##### Workflow Automation

- Visual workflow builder
- Eight built-in workflow templates
- Automation rules
- Run-now automation

##### Governance

- Multi-stage approval workflows
- Immutable audit trail
- Organization management
- RBAC
- Enterprise search

##### Compliance Intelligence

- AI impact analysis
- Regulation ↔ Policy ↔ Control mapping
- Coverage scoring
- Relationship graph

##### Collaboration

- Comments
- Evidence
- Review cycles
- Compliance calendar

##### Executive

- Executive Dashboard
- Reporting Engine
- Export packages

#### Added

- Policy Workspace under Library with grid, list, and timeline views
- Policy version control with restore, AI change summary, and side-by-side diff
- Multi-step approval workflows with electronic sign-off comments and timestamps
- Visual workflow builder with reusable templates
- Immutable audit trail with user/action filters and export
- Organization structure (departments, business units, locations, teams)
- Role-based access control across view/edit/delete/approve/export/manage
- Enterprise search across policies, regulations, tasks, evidence, reports, comments, and people
- Executive Dashboard and Reporting Engine (PDF / Word / PowerPoint text packages)
- Compliance Calendar and automation rules engine

### v0.7.0 — Execution Platform

**Status:** Stable  
**Sprint:** 7 (`SPRINT7_COMPLETE`)  
**Date:** 2026-08-02

RegIntel moves from AI compliance assistant to AI-powered compliance execution platform.

#### Highlights

- Complete AI Workspace redesign
- Premium Apple / Harvey UI
- Action Center
- Kanban Work Management
- AI Task Generator
- AI Recommendation Cards
- Task Detail Pages
- Notifications
- Smart Due Dates
- Home Dashboard overhaul

#### Added

- Action Center with My Tasks, Assigned, Due Today, Overdue, Awaiting Approval, and Completed sections
- Work views: Board (drag-and-drop), List, Calendar, and Timeline
- Task detail pages with ownership, checklist progress, evidence, comments, subtasks, and activity
- One-click AI actions (task, project, policy update, checklist, control, owner, review, board item)
- AI implementation task generator with select/deselect and bulk create
- AI recommendation cards with impact, owner, priority, and estimated effort
- Smart due-date estimates (recommended days, effort hours, business impact)
- Global Work widget and grouped Notification Center (Tasks, Approvals, AI, Deadlines, Regulations)
- AI Workspace modes: Chat, Research, Document Analysis, Compare, Drafting

#### Changed

- Design system: purple accent (`#6D5EF6`), `#FAFAFA` background, Inter typography
- Primary navigation limited to Home, AI Workspace, Library, Work, Reports, Settings
- Home dashboard surfaces actionable compliance work instead of static metrics
- Work task statuses expanded for board workflow (Backlog → Completed)
