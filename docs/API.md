# API

## Purpose

This document is the human index for RegIntel's API surface. **Authoritative conventions** (versioning, auth, errors, pagination, OpenAPI) live in [`BACKEND_ARCHITECTURE.md`](./BACKEND_ARCHITECTURE.md) until the NestJS API exists and this file is filled with concrete routes.

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

No production API implementation yet (B001+). The frontend uses mock providers; first domain cutovers are **B016–B020** behind feature flags. Foundation auth/org APIs are **B003–B005**.

See [`BACKEND_ARCHITECTURE.md`](./BACKEND_ARCHITECTURE.md) and [`ROADMAP.md`](./ROADMAP.md).

## 2. Conventions

Frozen in the Backend Architecture Contract:

- REST JSON under **`/api/v1`**
- List envelope `{ data, meta }` with offset pagination
- Stable error object (see contract §8)

## 3. Authentication

Frozen: **JWT access (Bearer)** + **httpOnly refresh cookie**; **Argon2** password hashing. MFA/SSO later (B006+). Details: [`BACKEND_ARCHITECTURE.md`](./BACKEND_ARCHITECTURE.md) §6.

## 4. Endpoints

| Method | Path | Description | Status |
|---|---|---|---|
| — | — | Concrete routes land with B001–B005 | Not Started |

Swagger will be served at `/api/docs` once B005 lands.

## 5. Error Handling

Stable shape documented in [`BACKEND_ARCHITECTURE.md`](./BACKEND_ARCHITECTURE.md) §8 (`error.code`, `message`, `statusCode`, `correlationId`, `details`).

## 6. Versioning

URL prefix **`/api/v1`**. Breaking changes require a new major API version segment.

## 7. Rate Limiting

Deferred past Milestone B1; document when introduced.

## 8. Revision History

| Date | Author | Change |
|---|---|---|
| 2026-08-03 | Phase B planning | Point to Backend Architecture Contract; clarify B1 vs B016–B020 |
| TBD | TBD | Initial placeholder document created |
