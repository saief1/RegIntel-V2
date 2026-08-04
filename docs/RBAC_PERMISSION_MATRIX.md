# RBAC Permission Matrix (Milestone B2)

Database-seeded roles and permissions. Source: `backend/src/modules/rbac/rbac.constants.ts` + `roles` / `permissions` / `role_permissions` tables.

## Roles

| Key | Name | Scope |
|---|---|---|
| `SUPER_ADMIN` | Super Admin | Platform (`users.is_super_admin`) |
| `ORG_ADMIN` | Organization Admin | Organization |
| `COMPLIANCE_OFFICER` | Compliance Officer | Organization |
| `MANAGER` | Manager | Organization |
| `ANALYST` | Analyst | Organization |
| `VIEWER` | Viewer | Organization |

## Permissions by role

| Permission | SUPER_ADMIN | ORG_ADMIN | COMPLIANCE_OFFICER | MANAGER | ANALYST | VIEWER |
|---|---|---|---|---|---|---|
| `org:read` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| `org:manage` | ✓ | ✓ | | | | |
| `users:read` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| `users:manage` | ✓ | ✓ | | | | |
| `roles:read` | ✓ | ✓ | ✓ | ✓ | | |
| `roles:manage` | ✓ | ✓ | | | | |
| `security:read` | ✓ | ✓ | ✓ | | | |
| `security:manage` | ✓ | ✓ | | | | |
| `cases:read` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| `cases:write` | ✓ | ✓ | ✓ | ✓ | ✓ | |
| `policies:read` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| `policies:write` | ✓ | ✓ | ✓ | | | |
| `policies:approve` | ✓ | ✓ | ✓ | | | |
| `tasks:read` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| `tasks:write` | ✓ | ✓ | ✓ | ✓ | ✓ | |
| `reports:read` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| `reports:export` | ✓ | ✓ | ✓ | ✓ | | |
| `audit:read` | ✓ | ✓ | ✓ | | | |
| `scim:manage` | ✓ | ✓ | | | | |
| `sso:manage` | ✓ | ✓ | | | | |

## Effective permissions

1. Start from role permissions (DB `role_permissions`, matrix fallback).
2. Add org / team / resource **ALLOW** grants (`permission_grants`).
3. Apply **DENY** grants (deny wins).
4. Super Admin receives the full permission catalog.
