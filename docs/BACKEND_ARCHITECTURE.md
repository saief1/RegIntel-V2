# Backend Architecture Contract

## Purpose

This document is the **Backend Architecture Contract** for Phase B. It is the backend equivalent of the frontend design system: frozen technology choices, conventions, and Milestone B1 exit criteria that agents and humans must follow when implementing **B001+**.

**Status:** Accepted for planning (B000). **No NestJS / Prisma / Docker scaffolding yet** — coding begins only after explicit kickoff of B001.

**UI policy:** Frontend routes and pages stay as-is. Replace mock providers behind feature flags. No redesigns except where backend integration requires minimal wiring.

## Table of Contents

- [1. Technology Freeze](#1-technology-freeze)
- [2. Milestone B1 Scope (B001–B005)](#2-milestone-b1-scope-b001b005)
- [3. Repository Structure](#3-repository-structure)
- [4. Database Conventions](#4-database-conventions)
- [5. API Standards](#5-api-standards)
- [6. Authentication Flow](#6-authentication-flow)
- [7. Multi-Tenancy Model](#7-multi-tenancy-model)
- [8. Error Format](#8-error-format)
- [9. Logging](#9-logging)
- [10. Configuration](#10-configuration)
- [11. Testing Strategy](#11-testing-strategy)
- [12. Feature Flags (Mock → API Cutover)](#12-feature-flags-mock--api-cutover)
- [13. OpenAPI / Swagger Requirements](#13-openapi--swagger-requirements)
- [14. Docker Compose Local Stack](#14-docker-compose-local-stack)
- [15. Explicit Non-Goals (Milestone B1)](#15-explicit-non-goals-milestone-b1)
- [16. Definition of Done (B1)](#16-definition-of-done-b1)
- [17. Related Documents](#17-related-documents)
- [18. Revision History](#18-revision-history)

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

**Version target:** `v2.1.0` — Backend Foundation (tag only after B001–B005 implementation; **not** this docs PR).

| ID | Title | Objective |
|---|---|---|
| **B000** | Backend Architecture Contract | This document. Freeze stack, conventions, B1 exit criteria. **Prerequisite to B001.** |
| **B001** | NestJS scaffolding | Create `backend/` NestJS app, Docker Compose (Postgres + Redis + API), env loading, health endpoint, baseline lint/test scripts. |
| **B002** | Prisma schema foundation | PostgreSQL + Prisma; `User`, `Organization`, `Membership`, `RefreshToken` (or equivalent session store); migrations; seed for local dev. |
| **B003** | Auth API | Register (dev/local), login, logout, refresh; Argon2 hashing; JWT access + refresh cookie; guarded routes. |
| **B004** | Users & organizations API | CRUD-ish read/update for current user; org create/list/switch context; membership basics (no invites/SCIM yet). |
| **B005** | API foundation + OpenAPI | Global `/api/v1` prefix, error filter, pagination helpers, correlation ID middleware, Swagger UI, frontend feature-flag stubs ready for cutover. |

**B1 “done” looks like:** real users and orgs in PostgreSQL; working auth (login/logout/refresh); versioned REST API with OpenAPI; Docker Compose local stack; frontend flags prepared so mock providers can later call the API — without redesigning pages.

Later Phase B bands (see [`ROADMAP.md`](./ROADMAP.md)):

| Band | IDs | Theme |
|---|---|---|
| B1 Foundation | B001–B005 | Scaffolding, auth, user/org, Prisma, API foundation |
| Identity & access | B006–B010 | MFA, RBAC, Permissions, SSO, SCIM |
| Org structure | B011–B015 | Workspaces, Teams, Departments, Invitations, Tenant isolation |
| First live domains | B016–B020 | Replace mock providers: Knowledge, Policies, Tasks, Notifications, Cases |
| Platform services | B021–B025 | Storage, Jobs, Notification delivery hardening, Audit log, Multi-tenancy guarantees |

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
│   │   ├── common/           # filters, interceptors, guards, dto, prisma
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   ├── users/
│   │   │   ├── organizations/
│   │   │   └── health/
│   │   └── worker/           # BullMQ processors (stub ok in B1)
│   ├── test/                 # e2e / integration
│   ├── Dockerfile
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
├── docker-compose.yml        # Postgres, Redis, API (root or backend/ — prefer root)
└── package.json              # Frontend (existing)
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
| Audit | Immutable audit table deferred to **B024**; do not fake it in B1 |

### Prisma patterns (B1)

- Single `PrismaClient` via a Nest injectable `PrismaService`.
- Migrations committed to git; `prisma migrate deploy` in containers.
- Seed creates one demo org + admin user for local Compose (password only in `.env.example` / docs — never commit real secrets).
- Never use `prisma db push` as the production path.

### B1 core models (minimum)

- `organizations`
- `users` (global identity; email unique)
- `organization_memberships` (`user_id`, `organization_id`, role enum stub)
- Auth persistence: `refresh_tokens` (hashed token, expiry, revoked_at) **or** equivalent

---

## 5. API Standards

| Concern | Standard |
|---|---|
| Style | REST, JSON (`application/json`) |
| Base path | **`/api/v1`** |
| Health | `/api/v1/health` (or `/health` outside versioning — prefer under v1 for consistency) |
| Resource naming | Plural nouns: `/users`, `/organizations` |
| IDs in paths | UUID strings |
| Success bodies | Resource object or `{ data, meta }` for lists |
| Status codes | `200` OK, `201` Created, `204` No Content, `400` validation, `401` unauthenticated, `403` forbidden, `404` not found, `409` conflict, `429` rate limit (later), `500` unexpected |
| Pagination | Cursor **or** offset — **choose offset for B1** for speed: `?page=1&pageSize=20` (max pageSize 100). Response `meta: { page, pageSize, total }` |
| Filtering | Explicit query params (`status`, `q`); no arbitrary JSON filter DSL in B1 |
| Sorting | `?sort=createdAt:desc` (whitelist fields server-side) |
| Partial updates | `PATCH` with validated DTO |
| Idempotency | Not required in B1 except logout/refresh safety |
| CORS | Explicit allowlist via env (`CORS_ORIGINS`) for Vite origin |

### Envelope (lists)

```json
{
  "data": [],
  "meta": {
    "page": 1,
    "pageSize": 20,
    "total": 0
  }
}
```

Single resources may return the object directly (no forced envelope) for simplicity in B1; list endpoints always use `{ data, meta }`.

---

## 6. Authentication Flow

### Decision (frozen)

| Item | Choice |
|---|---|
| Access token | **JWT**, short-lived (**15 minutes**), sent as **`Authorization: Bearer <token>`** |
| Refresh token | Opaque (or JWT) random secret, stored **hashed** server-side, delivered as **`httpOnly` + `Secure` + `SameSite=Lax` cookie** named `refresh_token` |
| Password hashing | **Argon2** (id/memory params documented in auth module constants) |
| Session model | **Stateless access JWT** + **server-tracked refresh tokens** (revocable) |
| MFA / SSO | Interfaces/stubs only in B1; no TOTP/WebAuthn/OIDC/SAML flows yet |

### Flows

1. **Login** `POST /api/v1/auth/login`  
   Body: `{ email, password }`.  
   Validates credentials → issues access JWT in JSON body `{ accessToken, expiresIn, user }` → sets refresh cookie.

2. **Refresh** `POST /api/v1/auth/refresh`  
   Reads refresh cookie → rotates refresh token → returns new access token. Reuse of an old refresh token → revoke family / force re-login (document rotation policy in auth module).

3. **Logout** `POST /api/v1/auth/logout`  
   Revokes current refresh token (and optionally all for user) → clears cookie → `204`.

4. **Protected routes**  
   Nest `AuthGuard` validates Bearer access JWT; attaches `RequestUser` (`userId`, `email`) and resolves **active `organizationId`** from header or membership default (see tenancy).

### Active organization

- Client sends **`X-Organization-Id: <uuid>`** on tenant-scoped requests after login.
- Server verifies membership before proceeding.
- B1 may also expose `POST /api/v1/auth/context` or include `organizations[]` on login payload for the org switcher.

### Cookies vs Bearer (summary)

- **Bearer access** — best for OpenAPI/Swagger “Authorize”, mobile/future clients, and explicit FE storage in memory (prefer memory over `localStorage` when wiring FE).
- **httpOnly refresh cookie** — mitigates XSS exfiltration of long-lived credentials; requires Compose/Vite proxy or aligned CORS + `credentials: 'include'`.

---

## 7. Multi-Tenancy Model

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

## 8. Error Format

All non-2xx API errors use this **stable JSON shape**:

```json
{
  "error": {
    "code": "AUTH_INVALID_CREDENTIALS",
    "message": "Email or password is incorrect.",
    "statusCode": 401,
    "correlationId": "0f8c2e6a-5b1d-4c3a-9e2f-1a2b3c4d5e6f",
    "details": []
  }
}
```

| Field | Rules |
|---|---|
| `code` | Stable `SCREAMING_SNAKE` machine code; do not churn casually |
| `message` | Human-safe; no stack traces or SQL |
| `statusCode` | Matches HTTP status |
| `correlationId` | Echo request correlation ID |
| `details` | Optional array of `{ field, message }` for validation (`400`) |

Nest exception filter maps `HttpException`, Zod/class-validator errors, and unexpected errors (`INTERNAL_ERROR` / 500) into this shape.

---

## 9. Logging

| Rule | Standard |
|---|---|
| Format | **Structured JSON** logs (Nest logger or pino — choose one in B001 and stick to it) |
| Levels | `error`, `warn`, `info`, `debug` |
| Correlation | Middleware assigns `X-Correlation-Id` (accept inbound or generate UUID); attach to logs + error responses |
| PII | Do not log passwords, tokens, or full auth headers; mask emails if verbose debug is on |
| Request log | Method, path, status, duration_ms, organizationId, userId (ids only) |
| Audit vs logs | Application logs ≠ compliance audit trail (B024) |

---

## 10. Configuration

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

- Ship `backend/.env.example` with dummy values.
- Validate env at boot (fail fast).
- Docker Compose injects env for local stack; production secret source TBD in deployment docs later.

---

## 11. Testing Strategy

| Layer | Tooling (B1 direction) | Focus |
|---|---|---|
| Unit | Jest (Nest default) | Auth crypto helpers, pure mappers, guards |
| Integration | Jest + test DB (Compose service or testcontainers later) | Prisma repositories, auth flows against Postgres |
| E2E (API) | Nest e2e / supertest | Login → refresh → org-scoped GET; reject cross-tenant |
| Frontend e2e | Existing Playwright | Remains mock-default until flags flip; add API-mode specs later |

**Rules**

- CI for backend (when introduced) must run unit + integration against Postgres.
- No tests that assert mock UI data as proof of backend correctness.
- Coverage targets can be set in B001; prefer meaningful auth/tenancy tests over vanity %.

---

## 12. Feature Flags (Mock → API Cutover)

Frontend keeps current pages and providers. Cutover is **flag-driven**, not a rewrite.

| Flag (suggested) | Default | Effect |
|---|---|---|
| `VITE_USE_API_AUTH` | `false` | Use real auth API vs mock session |
| `VITE_USE_API_KNOWLEDGE` | `false` | Knowledge provider → API (B016+) |
| `VITE_USE_API_POLICIES` | `false` | Policies → API |
| `VITE_USE_API_TASKS` | `false` | Tasks → API |
| `VITE_USE_API_NOTIFICATIONS` | `false` | Notifications → API |
| `VITE_USE_API_CASES` | `false` | Cases → API |
| `VITE_API_BASE_URL` | `http://localhost:3000/api/v1` | API origin |

**B1 requirement:** introduce a small flag reader / API client stub so B003–B005 can be exercised without redesigning screens. Domain provider swaps are **B016–B020**.

Pattern: provider checks flag → if false, existing mock; if true, `fetch`/`apiClient` with Bearer + `credentials: 'include'` + `X-Organization-Id`.

---

## 13. OpenAPI / Swagger Requirements

- NestJS Swagger module serves docs at **`/api/docs`** (unversioned docs UI is fine).
- Every public route in B1 has OperationId, summary, and DTO schemas.
- Bearer auth scheme documented; cookie refresh documented in description (cookie auth in Swagger is limited — document manually).
- OpenAPI JSON available at `/api/docs-json` (or Nest default).
- `API.md` stays the human index; **contract details live here and in generated OpenAPI** — avoid drifting placeholders.

---

## 14. Docker Compose Local Stack

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

## 15. Explicit Non-Goals (Milestone B1)

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
- Tagging **v2.1.0** before B001–B005 code is done

---

## 16. Definition of Done (B1)

Milestone B1 (`v2.1.0`) is complete when:

1. `backend/` NestJS app runs via Docker Compose with Postgres + Redis.
2. Prisma migrations create users, organizations, memberships, refresh tokens.
3. Auth works: register/login (as scoped), refresh, logout; passwords hashed with Argon2.
4. REST API under `/api/v1` with stable error shape, correlation IDs, pagination helpers.
5. Swagger UI documents B1 routes.
6. Tenant context enforced on org-scoped endpoints (membership check).
7. Frontend feature-flag / API client stubs exist; UI still defaults to mocks.
8. Backend unit + integration tests cover auth and a cross-tenant denial case.
9. Docs updated (`API.md`, `DATABASE.md`, CHANGELOG) to match reality — not placeholders that contradict this contract.
10. Product Board / Roadmap: B001–B005 checked; version **v2.1.0** tagged.

---

## 17. Related Documents

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

## 18. Revision History

| Date | Author | Change |
|---|---|---|
| 2026-08-03 | Phase B planning | Initial Backend Architecture Contract (B000); tech freeze; B1 scope |
