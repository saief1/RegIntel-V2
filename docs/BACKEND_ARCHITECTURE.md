# Backend Architecture Contract

## Purpose

This document is the **Backend Architecture Contract** for Phase B. It is the backend equivalent of the frontend design system: frozen technology choices, conventions, and Milestone B1 exit criteria that agents and humans must follow when implementing **B001+**.

**Status:** ✅ Complete (standards locked). Milestone **B1** (`v2.1.0`) implements B001–B005; Milestone **B2** (`v2.2.0`) implements B006–B010 (MFA, RBAC, Permissions, SSO, SCIM); **v2.2.1** gap-fill adds sessions/Security Center APIs; Milestone **B3** (`v2.3.0`) implements B011–B015 (data layer, repositories, storage, jobs, notifications) against this contract.

**UI policy:** Frontend routes and pages stay as-is. Replace mock providers behind feature flags. No redesigns except where backend integration requires minimal wiring.

## Table of Contents

- [1. Technology Freeze](#1-technology-freeze)
- [2. Milestone B1 Scope (B001–B005)](#2-milestone-b1-scope-b001b005)
- [3. Repository Structure](#3-repository-structure)
- [4. Database Conventions](#4-database-conventions)
- [5. Database Migration Policy](#5-database-migration-policy)
- [6. API Standards](#6-api-standards)
- [7. API Versioning](#7-api-versioning)
- [8. Authentication Flow](#8-authentication-flow)
- [9. Multi-Tenancy Model](#9-multi-tenancy-model)
- [10. API Error Standard](#10-api-error-standard)
- [11. Audit Logging Standard](#11-audit-logging-standard)
- [12. Logging](#12-logging)
- [13. Configuration](#13-configuration)
- [14. Testing Strategy](#14-testing-strategy)
- [15. Feature Flag Strategy](#15-feature-flag-strategy)
- [16. OpenAPI / Swagger Requirements](#16-openapi--swagger-requirements)
- [17. Docker Compose Local Stack](#17-docker-compose-local-stack)
- [18. Release Discipline (Backend Milestones)](#18-release-discipline-backend-milestones)
- [19. Explicit Non-Goals (Milestone B1)](#19-explicit-non-goals-milestone-b1)
- [20. Definition of Done (B1)](#20-definition-of-done-b1)
- [21. Related Documents](#21-related-documents)
- [22. Revision History](#22-revision-history)

---

## 1. Technology Freeze

The following choices are **decided**. Do not reopen without an ADR in [`DECISIONS.md`](./DECISIONS.md) and product approval.

| Concern | Decision |
|---|---|
| API framework | **NestJS** (TypeScript) |
| Database | **PostgreSQL** |
| ORM / migrations | **Prisma** |
| Cache / ephemeral state | **Redis** |
| Job queue | **BullMQ** (Redis-backed) |
| API docs | **Swagger / OpenAPI** (NestJS Swagger) |
| Local runtime | **Docker & Docker Compose** |
| Password hashing | **Argon2** |
| Auth tokens | **JWT access + refresh** |
| MFA | Architecture **MFA-ready** (tables/interfaces reserved); **not implemented in B1** |
| Enterprise IdP | **OIDC / SAML-ready interfaces** only in B1; implementation later (B006+) |
| Frontend | Keep React routes/pages; swap mock providers behind flags; **no redesigns** |

Frontend remains the existing Vite app at repo root (`src/`). Backend is additive.

---

## 2. Milestone B1 Scope (B001–B005)

**Version target:** `v2.1.0` — Backend Foundation (tag only after B001–B005 implementation).

| ID | Title | Objective |
|---|---|---|
| **B000** | Backend Architecture Contract | This document. Freeze stack, conventions, B1 exit criteria. **Prerequisite to B001.** |
| **B001** | NestJS scaffolding | Create `backend/` NestJS app, Docker Compose (Postgres + Redis + API), env loading, health endpoint, baseline lint/test scripts. |
| **B002** | Prisma schema foundation | PostgreSQL + Prisma; `User`, `Organization`, `Membership`, `RefreshToken` (or equivalent session store); migrations; seed for local dev. |
| **B003** | Auth API | Register (dev/local), login, logout, refresh; Argon2 hashing; JWT access + refresh cookie; guarded routes. |
| **B004** | Users & organizations API | CRUD-ish read/update for current user; org create/list/switch context; membership basics (no invites/SCIM yet). |
| **B005** | API foundation + OpenAPI | Global `/api/v1` prefix, error filter, pagination helpers, request ID middleware, Swagger UI, frontend feature-flag stubs ready for cutover. |

**B1 “done” looks like:** real users and orgs in PostgreSQL; working auth (login/logout/refresh); versioned REST API with OpenAPI; Docker Compose local stack; frontend flags prepared so mock providers can later call the API — without redesigning pages.

Later Phase B bands (see [`ROADMAP.md`](./ROADMAP.md)):

| Band | IDs | Theme |
|---|---|---|
| B1 Foundation | B001–B005 | Scaffolding, auth, user/org, Prisma, API foundation |
| Identity & access | B006–B010 | MFA, RBAC, Permissions, SSO, SCIM |
| Data Layer & Notifications | B011–B015 | Postgres domain models, repositories, storage, BullMQ, notification APIs → **v2.3.0** ✅ |
| Platform Deepening | B016–B020 | Email delivery, immutable audit, org structure, workflow hardening, multi-tenancy → v2.4.0 |
| Backend Beta | B021–B025 | Hardening, remaining cutovers, ops → v2.5.0 |

---

## 3. Repository Structure

### Decision

Use **`backend/` at the repository root** (not `apps/api`).

**Rationale:** The frontend already owns the root (`src/`, Vite, Playwright). There is no existing backend package. Adding `backend/` is the lowest-disruption layout and avoids a premature monorepo/workspace migration. A future move to `apps/web` + `apps/api` would require explicit architecture approval (`CLAUDE.md` rule 6).

### Target layout (B001+)

```
RegIntel-V2/
├── src/                      # Existing React SPA (unchanged ownership)
├── e2e/                      # Frontend Playwright
├── docs/
│   └── BACKEND_ARCHITECTURE.md
├── backend/                  # NestJS API (created in B001)
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── migrations/
│   │   └── seed.ts
│   ├── src/
│   │   ├── main.ts
│   │   ├── app.module.ts
│   │   ├── config/
│   │   ├── common/           # filters, interceptors, guards, dto, prisma, audit
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   ├── users/
│   │   │   ├── organizations/
│   │   │   ├── health/
│   │   │   └── queue/        # BullMQ / Redis module stubs
│   │   └── worker/           # BullMQ processors (stub ok in B1)
│   ├── test/                 # e2e / integration
│   ├── Dockerfile
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
├── docker-compose.yml        # Postgres, Redis, API (root preferred)
└── package.json              # Frontend (existing) + root orchestration scripts
```

### Rules

- Backend has its **own** `package.json` under `backend/`. Do not dump Nest/Prisma deps into the frontend root package without approval.
- Shared types across FE/BE are **out of scope for B1** (no packages/workspace yet). Duplicate DTOs intentionally; reconcile later if needed.
- Do not relocate `src/` in B1.

---

## 4. Database Conventions

| Rule | Standard |
|---|---|
| Engine | PostgreSQL 16.x (Compose pin allowed) |
| ORM | Prisma; all schema changes via Prisma migrations |
| Primary keys | **UUID** (`uuid` / `@default(uuid())` or `gen_random_uuid()`) |
| Table names | **snake_case plural** mapped via `@@map` (e.g. model `User` → `users`) |
| Column names | **snake_case** via `@map` when Prisma field is camelCase |
| Timestamps | `created_at`, `updated_at` on all durable entities (`@updatedAt`) |
| Soft deletes | **Not default.** Prefer hard delete or explicit `status` enums. Soft delete (`deleted_at`) only where product requires recovery (document per model). B1: no soft deletes. |
| Tenant column | `organization_id` UUID FK on all tenant-scoped rows |
| Indexes | Index FKs and common filters (`organization_id`, email unique globally or per-org as specified) |
| Enums | Prisma enums for finite sets (role, membership status) |
| Money / decimals | Not in B1 |
| Audit | Contract + `AuditWriter` interface in B1; full immutable persistence in **B024** |

### Prisma patterns (B1)

- Single `PrismaClient` via a Nest injectable `PrismaService`.
- Migrations committed to git; `prisma migrate deploy` in containers.
- Seed creates one demo org + admin user for local Compose (password only in `.env.example` / docs — never commit real secrets).
- Never use `prisma db push` as the production path.

### B1 core models (minimum)

- `organizations`
- `users` (global identity; email unique; MFA-ready nullable fields reserved)
- `organization_memberships` (`user_id`, `organization_id`, role enum stub)
- Auth persistence: `refresh_tokens` (hashed token, expiry, revoked_at) **or** equivalent

---

## 5. Database Migration Policy

| Rule | Standard |
|---|---|
| Schema changes | **Prisma migrations only** — never hand-edit production schema |
| Manual SQL | **Forbidden** outside generated Prisma migration files |
| Migration authoring | `npx prisma migrate dev --name <descriptive_name>` locally; commit `prisma/migrations/**` |
| Deploy | `npx prisma migrate deploy` (CI/Compose/prod) |
| Seed scripts | **Versioned** under `backend/prisma/seed.ts` (and future seed modules); seeds are additive/idempotent where practical |
| Rollback | Prefer a new forward migration that reverses the change. If a migration must be rolled back before deploy: `prisma migrate resolve` / restore from backup per [`DEPLOYMENT.md`](./DEPLOYMENT.md). Do **not** rewrite already-applied migration history on shared environments. |
| Hotfixes | Same path — Prisma migration + review; no emergency DDL outside process |

### Local workflow

```bash
cd backend
npx prisma migrate dev --name add_example
npx prisma migrate deploy   # CI / Compose
npx prisma db seed
```

### Rollback procedure (summary)

1. **Dev (not yet shared):** reset with `prisma migrate reset` only on disposable local DBs.
2. **Shared / staging / prod:** ship a corrective forward migration; restore from volume/snapshot backup if data loss occurred.
3. Document the incident; never `migrate resolve` away from applied history without ops review.

---

## 6. API Standards

| Concern | Standard |
|---|---|
| Style | REST, JSON (`application/json`) |
| Base path | **`/api/v1`** |
| Health | `/api/v1/health` |
| Resource naming | Plural nouns: `/users`, `/organizations` |
| IDs in paths | UUID strings |
| Success bodies | **Canonical envelope** — see [§10](#10-api-error-standard) |
| Status codes | `200` OK, `201` Created, `204` No Content, `400` validation, `401` unauthenticated, `403` forbidden, `404` not found, `409` conflict, `429` rate limit (later), `500` unexpected |
| Pagination | Offset for B1: `?page=1&pageSize=20` (max pageSize 100). Response `meta: { page, pageSize, total }` inside success envelope |
| Filtering | Explicit query params (`status`, `q`); no arbitrary JSON filter DSL in B1 |
| Sorting | `?sort=createdAt:desc` (whitelist fields server-side) |
| Partial updates | `PATCH` with validated DTO |
| Idempotency | Not required in B1 except logout/refresh safety |
| CORS | Explicit allowlist via env (`CORS_ORIGINS`) for Vite origin |

### Success envelope (canonical)

Every successful JSON response (except `204 No Content`) uses:

```json
{
  "success": true,
  "data": {}
}
```

Lists:

```json
{
  "success": true,
  "data": [],
  "meta": {
    "page": 1,
    "pageSize": 20,
    "total": 0
  }
}
```

**Never invent per-module response shapes.** Nest interceptors/filters enforce this envelope consistently.

---

## 7. API Versioning

| Rule | Standard |
|---|---|
| Current | **Lock all public REST routes under `/api/v1/...`** |
| Docs UI | Swagger at `/api/docs` (UI may be unversioned; documented operations still target v1) |
| Next major | **No `/api/v2`** until a breaking change forces it and an ADR is approved |
| Compatibility | Additive changes preferred within v1 (new optional fields, new endpoints). Breaking changes require a version bump plan |

---

## 8. Authentication Flow

### Decision (frozen)

| Item | Choice |
|---|---|
| Access token | **JWT**, short-lived (**15 minutes**), sent as **`Authorization: Bearer <token>`** |
| Refresh token | Opaque random secret, stored **hashed** server-side, delivered as **`httpOnly` + `Secure` + `SameSite=Lax` cookie** named `refresh_token` |
| Password hashing | **Argon2** (id/memory params documented in auth module constants) |
| Session model | **Stateless access JWT** + **server-tracked refresh tokens** (revocable) |
| MFA / SSO | Interfaces/stubs only in B1; no TOTP/WebAuthn/OIDC/SAML flows yet |

### Flows

1. **Register** `POST /api/v1/auth/register` (enabled for local/dev; gate in production via config)  
   Body: `{ email, password, name, organizationName? }`.  
   Creates user (+ optional org/membership) → issues tokens like login.

2. **Login** `POST /api/v1/auth/login`  
   Body: `{ email, password }`.  
   Validates credentials → issues access JWT in JSON body under success envelope → sets refresh cookie.

3. **Refresh** `POST /api/v1/auth/refresh`  
   Reads refresh cookie → rotates refresh token → returns new access token. Reuse of an old refresh token → revoke family / force re-login.

4. **Logout** `POST /api/v1/auth/logout`  
   Revokes current refresh token (and optionally all for user) → clears cookie → `204`.

5. **Protected routes**  
   Nest `AuthGuard` validates Bearer access JWT; attaches `RequestUser` (`userId`, `email`) and resolves **active `organizationId`** from header or membership default (see tenancy).

### Active organization

- Client sends **`X-Organization-Id: <uuid>`** on tenant-scoped requests after login.
- Server verifies membership before proceeding.
- B1 may also expose org list on login/`/users/me` for the org switcher.

### Cookies vs Bearer (summary)

- **Bearer access** — best for OpenAPI/Swagger “Authorize”, mobile/future clients, and explicit FE storage in memory (prefer memory over `localStorage` when wiring FE).
- **httpOnly refresh cookie** — mitigates XSS exfiltration of long-lived credentials; requires Compose/Vite proxy or aligned CORS + `credentials: 'include'`.

### MFA / SSO readiness (B1 stubs)

- User model reserves nullable MFA fields (e.g. `mfaEnabled`, `mfaSecretEncrypted`) without enforcing MFA.
- `AuthProvider` / `OidcProvider` / `SamlProvider` interfaces exist as stubs; password provider is the only active implementation in B1.

---

## 9. Multi-Tenancy Model

| Rule | Standard |
|---|---|
| Tenant key | **`organization_id`** on every tenant-scoped row |
| Request context | After auth, Nest CLS / request-scoped context holds `{ userId, organizationId, role }` |
| Isolation | All queries for tenant data **must** include `organization_id` from context — never trust client-supplied org without membership check |
| Cross-tenant | Forbidden. No “superuser bypass” in B1 application code (platform admin later) |
| Global tables | `users`, auth tokens — not org-owned; membership links users to orgs |
| Row-level security | PostgreSQL RLS **not required in B1**; application-layer isolation + tests suffice. Revisit before pilot (Phase F) |

B011–B015 deepen workspaces/teams/departments/invites and isolation tests. B025 hardens guarantees and runbooks.

---

## 10. API Error Standard

**Canonical for every endpoint.** All non-2xx API errors use this stable JSON shape (Nest exception filters must emit exactly this — never invent per-module shapes):

```json
{
  "success": false,
  "error": {
    "code": "AUTH_INVALID_TOKEN",
    "message": "Access token has expired.",
    "requestId": "0f8c2e6a-5b1d-4c3a-9e2f-1a2b3c4d5e6f",
    "timestamp": "2026-08-03T20:00:00.000Z"
  }
}
```

Validation example (`400`):

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed.",
    "requestId": "...",
    "timestamp": "...",
    "details": [
      { "field": "email", "message": "email must be an email" }
    ]
  }
}
```

| Field | Rules |
|---|---|
| `success` | Always `false` on errors |
| `error.code` | Stable `SCREAMING_SNAKE` machine code; do not churn casually |
| `error.message` | Human-safe; no stack traces or SQL |
| `error.requestId` | Echo request ID from middleware (`X-Request-Id`). **Replaces earlier `correlationId` naming** — treat `correlationId` language in older notes as `requestId` |
| `error.timestamp` | ISO-8601 UTC |
| `error.details` | Optional array of `{ field, message }` for validation |

Success counterpart (see §6):

```json
{
  "success": true,
  "data": {}
}
```

Nest exception filter maps `HttpException`, class-validator errors, and unexpected errors (`INTERNAL_ERROR` / 500) into the error shape. Response interceptor wraps successful bodies in `{ success: true, data }`.

---

## 11. Audit Logging Standard

Every **sensitive action** must emit an audit event. Sensitive actions in B1+ include (non-exhaustive): login success/failure, logout, register, token refresh/reuse detection, password change, org create/membership change, permission changes (later), data exports (later).

### Minimum fields

| Field | Description |
|---|---|
| Event ID | UUID |
| User ID | Actor user UUID (nullable for anonymous failures) |
| Organization ID | Active tenant UUID when applicable |
| Action | Stable verb code, e.g. `auth.login`, `auth.logout`, `org.create` |
| Resource | Resource type + id, e.g. `user:<uuid>`, `organization:<uuid>` |
| Before / After | JSON snapshots when a mutation changes state (omit when N/A) |
| Timestamp | ISO-8601 UTC |
| IP address | From request (respect proxy headers carefully) |
| User agent | From request |

### B1 vs later

- **B1:** Define the contract and an `AuditWriter` interface (Nest injectable). Implementation may be a **structured-log stub** that writes audit-shaped JSON to the application logger.
- **B024:** Persist immutable audit rows (append-only table / store) and query APIs.
- Application debug logs ≠ compliance audit trail — keep channels separate even when the B1 stub logs to stdout.

---

## 12. Logging

| Rule | Standard |
|---|---|
| Format | **Structured JSON** logs (Nest logger or pino — choose one in B001 and stick to it) |
| Levels | `error`, `warn`, `info`, `debug` |
| Request ID | Middleware assigns `X-Request-Id` (accept inbound or generate UUID); attach to logs + error responses as `requestId` |
| PII | Do not log passwords, tokens, or full auth headers; mask emails if verbose debug is on |
| Request log | Method, path, status, duration_ms, organizationId, userId (ids only) |
| Audit vs logs | Application logs ≠ compliance audit trail (see §11 / B024) |

---

## 13. Configuration

Follow **12-factor**: config via environment variables; secrets never committed.

| Variable | Purpose | B1 |
|---|---|---|
| `NODE_ENV` | `development` / `test` / `production` | Required |
| `PORT` | API port (default `3000`) | Required |
| `DATABASE_URL` | PostgreSQL connection string | Required |
| `REDIS_URL` | Redis connection string | Required (even if queues stubbed) |
| `JWT_ACCESS_SECRET` | Access token signing secret | Required |
| `JWT_ACCESS_TTL` | e.g. `15m` | Required |
| `JWT_REFRESH_TTL` | e.g. `7d` | Required |
| `REFRESH_COOKIE_NAME` | default `refresh_token` | Optional |
| `CORS_ORIGINS` | Comma-separated Vite origins | Required |
| `COOKIE_SECURE` | `true` in prod | Required |
| `LOG_LEVEL` | default `info` | Optional |
| `ALLOW_REGISTER` | `true` in local/dev | Optional (default false in prod) |

- Ship `backend/.env.example` with dummy values.
- Validate env at boot (fail fast).
- Docker Compose injects env for local stack; production secret source TBD in deployment docs later.

---

## 14. Testing Strategy

| Layer | Tooling (B1 direction) | Focus |
|---|---|---|
| Unit | Jest (Nest default) | Auth crypto helpers, pure mappers, guards |
| Integration | Jest + test DB (Compose service or local Postgres) | Prisma repositories, auth flows against Postgres |
| E2E (API) | Nest e2e / supertest | Login → refresh → org-scoped GET; reject cross-tenant |
| Frontend e2e | Existing Playwright | Remains mock-default until flags flip; add API-mode specs later |

**Rules**

- CI for backend (when introduced) must run unit + integration against Postgres when available.
- No tests that assert mock UI data as proof of backend correctness.
- Coverage targets can be set in B001; prefer meaningful auth/tenancy tests over vanity %.

---

## 15. Feature Flag Strategy

Frontend keeps current pages and providers. Cutover is **flag-driven**, not a rewrite. Flags default to **`false`** until the corresponding real API is ready.

### Canonical flag names

| Flag | Default | Effect |
|---|---|---|
| `USE_REAL_AUTH` | `false` | Use real auth API vs mock session |
| `USE_REAL_ORGS` | `false` | Organizations API vs mock tenancy |
| `USE_REAL_RBAC` | `false` | Real permissions/RBAC API |
| `USE_REAL_STORAGE` | `false` | Object storage (B021+) |
| `USE_REAL_KNOWLEDGE` | `false` | Knowledge provider → API (B016+) |
| `USE_REAL_TASKS` | `false` | Tasks → API |
| `USE_REAL_REPORTS` | `false` | Reports → API |
| `USE_REAL_POLICIES` | `false` | Policies → API |
| `USE_REAL_NOTIFICATIONS` | `false` | Notifications → API |
| `USE_REAL_CASES` | `false` | Cases → API |

### How they are read

| Surface | Mechanism |
|---|---|
| Frontend (Vite) | Env vars **must** be prefixed `VITE_` to be exposed to the client, e.g. `VITE_USE_REAL_AUTH=true`. Reader maps `import.meta.env.VITE_USE_REAL_AUTH === 'true'`. Defaults **false** when unset. |
| Backend (optional) | Same logical names without `VITE_` if server-side gating is needed later; B1 primarily uses FE flags for mock cutover. |
| API base | `VITE_API_BASE_URL` default `http://localhost:3000/api/v1` |

**B1 requirement:** introduce a small flag reader + API client stub so real auth can be exercised without redesigning screens. Domain provider swaps are **B016–B020**.

Pattern: provider checks flag → if false, existing mock; if true, `fetch`/`apiClient` with Bearer + `credentials: 'include'` + `X-Organization-Id`.

> Earlier draft names (`VITE_USE_API_*`) are superseded by `VITE_USE_REAL_*` / `USE_REAL_*`.

---

## 16. OpenAPI / Swagger Requirements

- NestJS Swagger module serves docs at **`/api/docs`** (unversioned docs UI is fine).
- Every public route in B1 has OperationId, summary, and DTO schemas.
- Bearer auth scheme documented; cookie refresh documented in description (cookie auth in Swagger is limited — document manually).
- OpenAPI JSON available at `/api/docs-json` (Nest default).
- Release checklist includes exporting or smoke-verifying OpenAPI (`/api/docs-json`).
- `API.md` stays the human index; **contract details live here and in generated OpenAPI** — avoid drifting placeholders.

---

## 17. Docker Compose Local Stack

Root (preferred) `docker-compose.yml` services:

| Service | Image / build | Port (host) |
|---|---|---|
| `db` | `postgres:16` | `5432` |
| `redis` | `redis:7` | `6379` |
| `api` | build `./backend` | `3000` |

**Expectations**

- `docker compose up` yields a healthy API + migrated schema + seed user.
- Vite continues via `npm run dev` on the host; points at `VITE_API_BASE_URL`.
- Named volumes for Postgres data.
- No cloud dependencies required for B1 local demo.

BullMQ workers may run in-process in B1; split worker service later (B021–B022).

---

## 18. Release Discipline (Backend Milestones)

For each backend milestone release (starting with B1 / `v2.1.0`), complete in order:

1. **Build** — backend + frontend production builds
2. **Lint** — backend ESLint + frontend ESLint
3. **Backend tests** — unit / integration / API e2e as available
4. **Frontend regression** — Playwright (mock defaults)
5. **API contract verification** — OpenAPI reachable; smoke health (+ login when Compose/DB available)
6. **Docs** — CHANGELOG, RELEASE_NOTES, ROADMAP / Product Board, API.md / DATABASE.md as needed
7. **Commit** — logical commits; final `release: vX.Y.Z …`
8. **Tag** — annotated version tag + milestone tag
9. **Push** — branch/main + tags

Do not tag a foundation version until B1 Definition of Done items are met.

---

## 19. Explicit Non-Goals (Milestone B1)

Do **not** implement in B001–B005:

- MFA (TOTP/WebAuthn) — architecture ready only
- SSO (OIDC/SAML) — interfaces only
- SCIM provisioning
- Full RBAC / fine-grained permissions engine (membership role stub is enough)
- Workspaces, teams, departments, invitations (B011–B015)
- Replacing Knowledge / Policies / Tasks / Notifications / Cases mocks (B016–B020)
- Object storage / signed URLs (B021+)
- Production email delivery
- Billing, licensing, metering
- AI orchestration (Phase C)
- PostgreSQL RLS
- Frontend redesigns or new business modules
- npm monorepo / Turborepo migration
- Full audit persistence (B024) — interface + stub only
- Tagging **v2.1.0** before B001–B005 code is done

---

## 20. Definition of Done (B1)

Milestone B1 (`v2.1.0`) is complete when:

1. `backend/` NestJS app runs via Docker Compose with Postgres + Redis.
2. Prisma migrations create users, organizations, memberships, refresh tokens.
3. Auth works: register/login (as scoped), refresh, logout; passwords hashed with Argon2.
4. REST API under `/api/v1` with canonical success/error envelopes and `requestId`.
5. Swagger UI documents B1 routes.
6. Tenant context enforced on org-scoped endpoints (membership check).
7. Frontend feature-flag / API client stubs exist; UI still defaults to mocks.
8. Backend unit + integration tests cover auth and a cross-tenant denial case.
9. Docs updated (`API.md`, `DATABASE.md`, CHANGELOG) to match reality — not placeholders that contradict this contract.
10. Product Board / Roadmap: B001–B005 checked; version **v2.1.0** tagged.
11. Audit writer interface exists (stub persistence acceptable).

---

## 21. Related Documents

- [`ROADMAP.md`](./ROADMAP.md) — Phase B ticket bands and version targets
- [`PRODUCT_BOARD.md`](./PRODUCT_BOARD.md) — phase status mirror
- [`API.md`](./API.md) — human API index (defers to this contract until implemented)
- [`DATABASE.md`](./DATABASE.md) — schema detail (filled as Prisma lands)
- [`ARCHITECTURE.md`](./ARCHITECTURE.md) — frontend platform + pointer here
- [`MASTER_SPEC.md`](./MASTER_SPEC.md) — product/tech source of truth
- [`SECURITY.md`](./SECURITY.md) — security posture (to align with this contract)
- [`DECISIONS.md`](./DECISIONS.md) — ADRs for any freeze changes
- [`UI_GUIDELINES.md`](./UI_GUIDELINES.md) — UI remains frozen

---

## 22. Revision History

| Date | Author | Change |
|---|---|---|
| 2026-08-03 | Milestone B1 | Complete contract standards: success/error envelopes (`requestId`), audit logging, `USE_REAL_*` flags, `/api/v1` lock, migration policy, release discipline |
| 2026-08-03 | Phase B planning | Initial Backend Architecture Contract (B000); tech freeze; B1 scope |
