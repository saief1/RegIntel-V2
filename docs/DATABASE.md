# Database

## Purpose

This document describes RegIntel's data model, schema, storage technology, and migration policy. Source of truth for conventions: [`BACKEND_ARCHITECTURE.md`](./BACKEND_ARCHITECTURE.md). Prisma schema: `backend/prisma/schema.prisma`.

## Table of Contents

- [1. Overview](#1-overview)
- [2. Technology Choice](#2-technology-choice)
- [3. Schema](#3-schema)
- [4. Entity Relationship Diagram](#4-entity-relationship-diagram)
- [5. Migrations](#5-migrations)
- [6. Data Retention & Backup](#6-data-retention--backup)
- [7. Revision History](#7-revision-history)

## 1. Overview

Milestone B1 introduced PostgreSQL via Prisma with users, organizations, memberships, and refresh tokens. Milestone **B2** adds MFA recovery codes, RBAC roles/permissions, SSO/SCIM configuration, teams (minimal for grants), and permission grants. Seed creates demo org + super-admin user, RBAC catalog, and mock SSO configs.

## 2. Technology Choice

| Item | Decision |
|---|---|
| Engine | PostgreSQL 16 |
| ORM / migrations | Prisma only (no manual schema edits) |
| PKs | UUID |
| Tenancy | `organization_id` on tenant-scoped rows |
| Local | Docker Compose `db` service (or local Postgres) |

## 3. Schema

| Table | Description | Status |
|---|---|---|
| `organizations` | Tenant root | ✅ B1 |
| `users` | Global identity; MFA + `is_super_admin` / `external_id` | ✅ B1/B2 |
| `organization_memberships` | User↔org; legacy `role` + `app_role` | ✅ B1/B2 |
| `refresh_tokens` | Hashed refresh tokens + family rotation | ✅ B1 |
| `roles` / `permissions` / `role_permissions` | DB-driven RBAC catalog | ✅ B2 |
| `mfa_recovery_codes` | Hashed MFA recovery codes | ✅ B2 |
| `sso_configurations` | OIDC/SAML provider configs | ✅ B2 |
| `scim_configurations` / `scim_groups` / `scim_sync_runs` | SCIM provisioning | ✅ B2 |
| `teams` / `team_memberships` | Minimal teams for permission scope (full org structure in B011) | ✅ B2 |
| `permission_grants` | Org/team/resource ALLOW/DENY grants | ✅ B2 |

## 4. Entity Relationship Diagram

```
organizations 1──* organization_memberships *──1 users
users 1──* refresh_tokens
users 1──* mfa_recovery_codes
organizations 1──* sso_configurations
organizations 1──1 scim_configurations
organizations 1──* teams 1──* team_memberships *──1 users
roles *──* permissions (via role_permissions)
organizations 1──* permission_grants *──1 permissions
```

## 5. Migrations

- **Policy:** Prisma migrations only; seed scripts versioned (`backend/prisma/seed.ts`)
- **Apply:** `npx prisma migrate deploy`
- **Dev create:** `npx prisma migrate dev --name <name>`
- **Rollback:** forward corrective migration on shared envs; `migrate reset` only on disposable local DBs
- Details: Architecture Contract §5 and `backend/README.md`

## 6. Data Retention & Backup

Compose uses a named volume `regintel_pg_data`. Production backup/retention TBD in deployment docs (pre-pilot).

## 7. Revision History

| Date | Author | Change |
|---|---|---|
| 2026-08-03 | Milestone B2 | Identity tables: RBAC, MFA recovery, SSO, SCIM, grants, teams |
| 2026-08-03 | Milestone B1 | Document B1 Prisma models, migration policy |
| 2026-08-03 | Phase B planning | Point to Backend Architecture Contract (Postgres + Prisma freeze) |
| TBD | TBD | Initial placeholder document created |
