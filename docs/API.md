# API

## Purpose

This document is the human index for RegIntel's API surface. **Authoritative conventions** (versioning, auth, errors, pagination, OpenAPI) live in [`BACKEND_ARCHITECTURE.md`](./BACKEND_ARCHITECTURE.md). Generated OpenAPI is served at `/api/docs-json`.

## Table of Contents

- [1. Overview](#1-overview)
- [2. Conventions](#2-conventions)
- [3. Authentication](#3-authentication)
- [4. Endpoints](#4-endpoints)
- [5. Error Handling](#5-error-handling)
- [6. Versioning](#6-versioning)
- [7. Rate Limiting](#7-rate-limiting)
- [8. Revision History](#8-revision-history)

## 1. Overview

Milestone **B4 (v2.4.0)** adds email, immutable audit, search, multi-tenancy quotas/rate limits, and ops probes on top of B3. Frontend still defaults to mock providers; enable per-domain with `VITE_USE_REAL_*` (all default **false**). New flags: `VITE_USE_REAL_EMAIL`, `VITE_USE_REAL_AUDIT`, `VITE_USE_REAL_SEARCH`.

- Local API: `http://localhost:3000/api/v1`
- Swagger UI: `http://localhost:3000/api/docs`

## 2. Conventions

- REST JSON under **`/api/v1`**
- Success: `{ "success": true, "data": ... }` (lists may include `meta`)
- Errors: `{ "success": false, "error": { code, message, requestId, timestamp } }`
- Tenant header: `X-Organization-Id` on org-scoped routes

## 3. Authentication

- **JWT access (Bearer)** + **httpOnly refresh cookie** (`refresh_token` on `/api/v1/auth`)
- **Argon2id** password hashing
- **MFA TOTP** + recovery codes (B006); login returns `mfaRequired` + challenge token when enrolled
- **SSO** OIDC/SAML configuration interfaces with mock providers (B008); real IdP wiring later
- **SCIM** bearer-token provisioning under `/api/v1/scim/v2/*` (B009)

## 4. Endpoints

| Method | Path | Description | Status |
|---|---|---|---|
| GET | `/api/v1/health` | Aggregated health + dependency matrix | ✅ B1/B4 |
| GET | `/api/v1/liveness` | Process liveness probe | ✅ B4 |
| GET | `/api/v1/readiness` | Readiness + dependency checks | ✅ B4 |
| GET | `/api/v1/metrics` | Prometheus metrics | ✅ B4 |
| GET | `/api/v1/ops/env` | Non-secret env diagnostics | ✅ B4 |
| POST | `/api/v1/auth/register` | Register (when `ALLOW_REGISTER=true`) | ✅ B1 |
| POST | `/api/v1/auth/login` | Login; MFA challenge when enrolled | ✅ B1/B2 |
| POST | `/api/v1/auth/mfa/verify` | Complete MFA login challenge | ✅ B2 |
| POST | `/api/v1/auth/refresh` | Rotate refresh; new access token | ✅ B1 |
| POST | `/api/v1/auth/logout` | Revoke refresh; clear cookie | ✅ B1 |
| GET | `/api/v1/users/me` | Current user + orgs | ✅ B1 |
| PATCH | `/api/v1/users/me` | Update profile | ✅ B1 |
| GET | `/api/v1/organizations` | List memberships | ✅ B1 |
| POST | `/api/v1/organizations` | Create org (caller becomes ORG_ADMIN) | ✅ B1 |
| GET | `/api/v1/organizations/:id` | Get org (`X-Organization-Id` required) | ✅ B1 |
| GET/POST | `/api/v1/mfa/*` | MFA status, enroll, disable, recovery codes | ✅ B2 |
| GET | `/api/v1/rbac/roles` | List roles | ✅ B2 |
| GET | `/api/v1/rbac/permissions` | Permission catalog | ✅ B2 |
| GET | `/api/v1/rbac/matrix` | Role × permission matrix | ✅ B2 |
| PATCH | `/api/v1/rbac/organizations/:orgId/members/:userId/role` | Assign AppRole | ✅ B2 |
| GET | `/api/v1/permissions/me` | Effective permissions | ✅ B2 |
| GET | `/api/v1/permissions/check` | Permission check | ✅ B2 |
| GET/POST/DELETE | `/api/v1/permissions/grants` | Org/team/resource grants | ✅ B2 |
| GET/PUT/POST | `/api/v1/sso/configurations*` | SSO provider config + mock authorize/callback | ✅ B2 |
| GET/PUT | `/api/v1/scim/configuration` | SCIM admin config | ✅ B2 |
| GET | `/api/v1/scim/status` | Sync status | ✅ B2 |
| GET/PUT | `/api/v1/scim/mappings` | Group → role mappings | ✅ B2 |
| * | `/api/v1/scim/v2/Users` | SCIM user provision/deprovision | ✅ B2 |
| * | `/api/v1/scim/v2/Groups` | SCIM group provision | ✅ B2 |
| GET | `/api/v1/sessions` | List active refresh sessions | ✅ v2.2.1 |
| GET | `/api/v1/sessions/policy` | Idle timeout policy | ✅ v2.2.1 |
| DELETE | `/api/v1/sessions/:sessionId` | Revoke session family | ✅ v2.2.1 |
| POST | `/api/v1/sessions/logout-everywhere` | Revoke all sessions | ✅ v2.2.1 |
| GET/DELETE | `/api/v1/security/devices*` | MFA trusted devices | ✅ v2.2.1 |
| GET | `/api/v1/security/login-history` | Login history | ✅ v2.2.1 |
| GET | `/api/v1/security/failed-logins` | Failed login attempts | ✅ v2.2.1 |
| GET | `/api/v1/security/events` | Security events | ✅ v2.2.1 |
| GET | `/api/v1/security/audit-trail` | Queryable audit trail (B024 full store later) | ✅ v2.2.1 |
| GET | `/api/v1/security/password-history` | Password change metadata | ✅ v2.2.1 |
| POST | `/api/v1/security/password` | Change password (+ history / revoke sessions) | ✅ v2.2.1 |
| GET/POST/PATCH/DELETE | `/api/v1/policies` | Policy CRUD (+ soft delete, optimistic version) | ✅ B3 |
| GET/POST/PATCH/DELETE | `/api/v1/tasks` | Task CRUD | ✅ B3 |
| GET/POST/PATCH/DELETE | `/api/v1/cases` | Case CRUD | ✅ B3 |
| GET/POST/PATCH/DELETE | `/api/v1/knowledge` | Knowledge document CRUD | ✅ B3 |
| GET/POST/PATCH/DELETE | `/api/v1/reports` | Report CRUD | ✅ B3 |
| GET/POST/PATCH/DELETE | `/api/v1/workflow` | Workflow definition CRUD | ✅ B3 |
| GET/POST | `/api/v1/notifications*` | List/create; preferences; bulk read; read-all; archive | ✅ B3 |
| GET/POST/DELETE | `/api/v1/storage*` | Upload/download/signed URL/delete/attachments | ✅ B3 |
| GET | `/api/v1/audit-entries` | Application audit entries | ✅ B3 |
| GET | `/api/v1/audit-entries/logs` | Immutable audit logs + filters | ✅ B4 |
| POST | `/api/v1/audit-entries/export` | Export audit logs (JSON/CSV) | ✅ B4 |
| GET | `/api/v1/audit-entries/exports` | List export jobs | ✅ B4 |
| GET | `/api/v1/audit-entries/retention` | Retention policy | ✅ B4 |
| GET/POST | `/api/v1/email/*` | Templates, send, deliveries, webhooks, health | ✅ B4 |
| GET/POST | `/api/v1/search*` | Query, rebuild, stats | ✅ B4 |
| GET/PATCH/POST | `/api/v1/tenancy*` | Tenant context, limits, feature flags | ✅ B4 |
| GET | `/api/v1/jobs/stats` | Queue monitoring (waiting/active/failed + DLQ names) | ✅ B3 |
| POST | `/api/v1/jobs/audit-cleanup` | Enqueue audit cleanup job | ✅ B3 |

List endpoints support `page`, `pageSize`, `sortBy`, `sortOrder`, and optional filters. Writes emit audit events. See [`EMAIL.md`](./EMAIL.md), [`AUDIT.md`](./AUDIT.md), [`SEARCH.md`](./SEARCH.md), [`MULTITENANCY.md`](./MULTITENANCY.md), [`OPERATIONS.md`](./OPERATIONS.md), [`STORAGE.md`](./STORAGE.md).

## 5. Error Handling

Canonical shape in [`BACKEND_ARCHITECTURE.md`](./BACKEND_ARCHITECTURE.md) §10 (`success: false`, `error.requestId`, `error.timestamp`).

## 6. Versioning

Locked to **`/api/v1`**. No `/api/v2` until necessary (ADR required).

## 7. Rate Limiting

Org-scoped RPM + daily API budget enforced when `X-Organization-Id` is present (B019). Responses may include `X-RateLimit-Remaining` / `X-RateLimit-Reset`. See [`MULTITENANCY.md`](./MULTITENANCY.md).

## 8. Revision History

| Date | Author | Change |
|---|---|---|
| 2026-08-04 | Milestone B4 | Email, audit logs/export, search, tenancy, ops probes; rate limiting |
| 2026-08-04 | Milestone B3 | Domain CRUD, notifications, storage, jobs endpoints |
| 2026-08-04 | v2.2.1 | Sessions + security center endpoints |
| 2026-08-03 | Milestone B2 | MFA, RBAC, permissions, SSO, SCIM endpoints |
| 2026-08-03 | Milestone B1 | Document B1 routes, envelopes, Swagger URLs |
| 2026-08-03 | Phase B planning | Point to Backend Architecture Contract; clarify B1 vs B016–B020 |
| TBD | TBD | Initial placeholder document created |
