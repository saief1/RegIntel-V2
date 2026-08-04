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

Milestone **B1** ships the NestJS foundation under `backend/`. The frontend still defaults to mock providers; domain cutovers are **B016–B020** behind `VITE_USE_REAL_*` flags. Auth can be pointed at the real API with `VITE_USE_REAL_AUTH=true`.

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
- MFA/SSO interfaces stubbed (B006+)

## 4. Endpoints

| Method | Path | Description | Status |
|---|---|---|---|
| GET | `/api/v1/health` | Liveness + DB readiness | ✅ B1 |
| POST | `/api/v1/auth/register` | Register (when `ALLOW_REGISTER=true`) | ✅ B1 |
| POST | `/api/v1/auth/login` | Login; sets refresh cookie | ✅ B1 |
| POST | `/api/v1/auth/refresh` | Rotate refresh; new access token | ✅ B1 |
| POST | `/api/v1/auth/logout` | Revoke refresh; clear cookie | ✅ B1 |
| GET | `/api/v1/users/me` | Current user + orgs | ✅ B1 |
| PATCH | `/api/v1/users/me` | Update profile | ✅ B1 |
| GET | `/api/v1/organizations` | List memberships | ✅ B1 |
| POST | `/api/v1/organizations` | Create org (caller becomes OWNER) | ✅ B1 |
| GET | `/api/v1/organizations/:id` | Get org (`X-Organization-Id` required) | ✅ B1 |

## 5. Error Handling

Canonical shape in [`BACKEND_ARCHITECTURE.md`](./BACKEND_ARCHITECTURE.md) §10 (`success: false`, `error.requestId`, `error.timestamp`).

## 6. Versioning

Locked to **`/api/v1`**. No `/api/v2` until necessary (ADR required).

## 7. Rate Limiting

Deferred past Milestone B1; document when introduced.

## 8. Revision History

| Date | Author | Change |
|---|---|---|
| 2026-08-03 | Milestone B1 | Document B1 routes, envelopes, Swagger URLs |
| 2026-08-03 | Phase B planning | Point to Backend Architecture Contract; clarify B1 vs B016–B020 |
| TBD | TBD | Initial placeholder document created |
