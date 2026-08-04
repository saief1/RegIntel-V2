# Release Notes

## RegIntel v2.3.0 — Data Layer & Notifications (Milestone B3)

**Date:** 2026-08-04  
**Tags:** `v2.3.0`, `MILESTONE_B3_COMPLETE`  
**Phase:** B (B011–B015)

### Headline

Production PostgreSQL data plane for core domains, repository-backed Nest APIs, Local object storage, BullMQ workers, and a real notification platform — without redesigning the UI. Frontend remains mock-default; flip `VITE_USE_REAL_*` per domain.

### Highlights

- Prisma domain models + migration `data_layer_b3` (policies, tasks, cases, knowledge, reports, workflows, notifications, storage, audit, activity)
- Repository interfaces; controllers → services → repositories (no Prisma in controllers)
- Local storage fully working; S3/Azure/GCS stubs fall back to Local — see [`STORAGE.md`](./STORAGE.md)
- BullMQ job queues with retries, DLQ naming, `/api/v1/jobs/stats`
- Notifications: in-app CRUD preferences, bulk read/archive; email delivery queued
- FE: `WorkProvider` loads real notifications when `VITE_USE_REAL_NOTIFICATIONS=true`

### Upgrade notes

- Root and backend `package.json` → `2.3.0`
- Apply: `cd backend && npx prisma migrate deploy && npx prisma db seed`
- Set `DIRECT_URL` (defaults to same as `DATABASE_URL` locally)
- Optional: `STORAGE_PROVIDER=local`, `STORAGE_LOCAL_ROOT=./storage`

### Next

**B016+** — Email delivery (real SMTP), then immutable audit, org structure, workflow hardening, multi-tenancy (→ v2.4.0). Do **not** start B016 in this release.

---

## RegIntel v2.2.1 — Identity & Sessions Completeness

**Date:** 2026-08-04  
**Tags:** `v2.2.1`, `B2_SESSIONS_COMPLETE`  
**Phase:** B (B2 gap-fill; does **not** retag v2.2.0)

### Headline

Completes session management and Security Center backends on top of shipped **v2.2.0** Identity & Access. Existing Security Center / Admin Console surfaces wire to real APIs when `VITE_USE_REAL_AUTH=true`. No new screens.

### Highlights

- Active sessions list / revoke / logout everywhere / idle timeout
- MFA trusted devices + remember browser
- Security events, login history, failed logins, password history, audit-trail query APIs
- Role aliases: Owner/Administrator/Reviewer/Employee/Guest (keys preserved; new REVIEWER/EMPLOYEE/GUEST)
- Flags: `VITE_USE_REAL_ORGS`, `VITE_USE_REAL_STORAGE` (default false)

### Upgrade notes

- Root and backend `package.json` → `2.2.1`
- Apply migration: `cd backend && npx prisma migrate deploy && npx prisma db seed`
- Optional: `SESSION_IDLE_TIMEOUT`, `MFA_TRUSTED_DEVICE_TTL`

### Next

Superseded by **v2.3.0** Data Layer & Notifications.

---

## RegIntel v2.2.0 — Identity & Access (Milestone B2)

**Date:** 2026-08-03  
**Tags:** `v2.2.0`, `B2_COMPLETE`  
**Phase:** B (B006–B010)

### Headline

Milestone **B2 Identity & Access Management** ships as **v2.2.0**: MFA (TOTP + recovery codes), database-driven RBAC, effective permission calculation, enterprise SSO interfaces (OIDC/SAML mock providers), and SCIM provisioning REST — continuing from the B1 NestJS foundation without redesigning the frontend.

### Highlights

- **MFA:** enroll/confirm/disable, login challenge + verify, hashed recovery codes
- **RBAC:** Super Admin / Org Admin / Compliance Officer / Manager / Analyst / Viewer with DB permission matrix + `PermissionsGuard`
- **Permissions:** org / team / resource grants, DENY overrides, `/permissions/me` + check
- **SSO:** OIDC + SAML configuration APIs with mock IdP providers; Settings route `/settings/security/sso`
- **SCIM:** Users/Groups provision + de-provision, mappings, sync status
- Feature flags: `VITE_USE_REAL_RBAC`, `VITE_USE_REAL_MFA`, `VITE_USE_REAL_SSO`, `VITE_USE_REAL_SCIM` (default **false**)

### Upgrade notes

- Root and backend `package.json` → `2.2.0`
- Apply migration: `cd backend && npx prisma migrate deploy && npx prisma db seed`
- Set `MFA_ENCRYPTION_KEY` (falls back to JWT secret in dev)
- UI unchanged except minimal SSO settings page + hub links

### Next

**B011+** — Org structure (workspaces, teams, departments, invitations, tenant isolation). Do not start until B2 is tagged.

---

## RegIntel v2.1.0 — Backend Foundation (Milestone B1)

**Date:** 2026-08-03  
**Tags:** `v2.1.0`, `MILESTONE_B1_COMPLETE`  
**Phase:** B (B001–B005)

### Headline

Milestone **B1 Backend Foundation** ships as **v2.1.0**: a production-shaped NestJS API with PostgreSQL/Prisma, JWT + Argon2 auth, users/organizations multi-tenancy, OpenAPI, and Docker Compose — while the React UI stays mock-default behind feature flags.

### Highlights

- `backend/` NestJS app + Compose stack (Postgres 16, Redis 7, API)
- Auth: login / logout / refresh / gated register; refresh cookie rotation
- Users & orgs with `X-Organization-Id` membership enforcement
- Canonical API envelopes (`success` + `requestId`); Swagger at `/api/docs`
- Frontend `VITE_USE_REAL_*` flags (default **false**) + API client stub
- Architecture Contract standards locked (errors, audit stub, migrations, release discipline)

### Upgrade notes

- Root and backend `package.json` version → `2.1.0`
- Local: `docker compose up --build` **or** Postgres/Redis + `cd backend && npx prisma migrate deploy && npx prisma db seed && npm run start:dev`
- Seed admin: `admin@regintel.local` / `ChangeMeAdmin123!` (change in real environments)
- UI unchanged unless `VITE_USE_REAL_AUTH=true`

### Next

Completed by **v2.2.0** (B006–B010).

---

## RegIntel v2.0.1 — Platform Stabilized

**Date:** 2026-08-03  
**Tags:** `v2.0.1`, `PHASE_A_COMPLETE`  
**Phase:** A (A001–A010)

### Headline

Phase A **Platform Stabilization** ships as **v2.0.1**. The frontend platform feels more consistently enterprise-grade: design-token alignment on key surfaces, accessibility and focus polish, standardized empty/error/loading patterns, and certified lint/build/e2e.

> Still **not** a finished SaaS. Auth, Postgres, live APIs, AI orchestration, and billing remain Phases B–F.

### Highlights

- Canonical Modal for What's New; notifications as accessible dialog panel
- Empty/error consistency (`EmptyState`, `NetworkErrorState`, ErrorBoundary retry)
- Work / Cases / Settings / AI / hub token + focus-visible polish
- Performance notes documented (`docs/PERFORMANCE.md`); large shell chunk deferred to Phase B
- Product Board: Phase A ✅ Complete 100%

### Upgrade notes

- `package.json` version is `2.0.1`
- No new npm dependencies
- See [`ROADMAP.md`](./ROADMAP.md) for Phase B (B001–B025)

### Next

**Phase B — Backend Platform** (auth → orgs → RBAC → Postgres → API → storage → jobs → notifications → audit → multi-tenancy).

---

## RegIntel v2.0.0 — Frontend Platform GA

**Date:** 2026-08-03  
**Tags:** `v2.0.0`, `SPRINT20_COMPLETE`  
**Sprint:** 20 (Release Candidate / GA Hardening)

### Headline

RegIntel **v2.0.0** marks **Frontend Platform GA**: a production-ready enterprise UI platform with a complete module surface (Sprints 1–19), shared design system, route-level code splitting, and hardened error/empty/loading patterns.

> **Important:** v2.0.0 is **not** a finished SaaS product. Real authentication, persistence, live integrations, production AI orchestration, and live billing are **explicitly out of scope** for this release and belong to post-GA Phases B–F / v3.0.

### What GA includes

- App shell with ≤6 primary nav items and secondary destinations
- Design tokens + shared UI primitives (Button, Badge, Card, Modal, Table, EmptyState, …)
- Lazy-loaded feature routes across Work, Knowledge, AI, Reports, Settings, Operations, Developer, Solutions, Commercial, and more
- Global React `ErrorBoundary` with recover actions
- `NetworkErrorState` for future API/offline surfaces (demoed on Integrations)
- Playwright smoke coverage across core routes and viewports (incl. 404)
- Documentation framing for Phases A–F (no Sprint 21+)

### What GA does **not** include

- Real user auth / SSO / session management
- Database persistence or multi-tenant isolation
- Live third-party integrations or webhooks
- Production LLM / agent orchestration
- Live Stripe (or equivalent) billing and entitlement enforcement

### Upgrade notes

- `package.json` version is `2.0.0`
- Mock data and in-memory providers remain the source of truth until Phase B
- Continue using design-system paths documented in [`ARCHITECTURE.md`](./ARCHITECTURE.md)

### Next

See [`ROADMAP.md`](./ROADMAP.md):

1. **Phase A** — Platform Stabilization (A001–A010)  
2. **Phase B** — Backend Platform (B001–B025)  
3. **Phase C** — AI Intelligence Layer (C001–C020)  
4. **Phase D** — Wealth Management Production (D001–D020)  
5. **Phase E** — Enterprise Integrations (E001–E015)  
6. **Phase F** — Pilot Customers (F001–F015)  
7. **v3.0** — Commercial Launch  

See [`ROADMAP.md`](./ROADMAP.md) Product Board. 

### Prior beta line

v1.0.0-beta through v1.9.0-beta delivered the module ladder (Autonomous Compliance → Commercial Platform). v2.0.0 hardens that frontend platform for GA without adding new business modules.
