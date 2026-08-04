# RBAC Permission Matrix (Milestone B2 + v2.2.1)

Database-seeded roles and permissions. Source: `backend/src/modules/rbac/rbac.constants.ts` + `roles` / `permissions` / `role_permissions` tables.

## Roles

| Key | Name | Aliases | Scope |
|---|---|---|---|
| `SUPER_ADMIN` | Super Admin | Super Admin | Platform (`users.is_super_admin`) |
| `ORG_ADMIN` | Administrator | Owner, Administrator, Organization Admin | Organization |
| `COMPLIANCE_OFFICER` | Compliance Officer | Compliance Officer | Organization |
| `MANAGER` | Manager | Manager | Organization |
| `ANALYST` | Analyst | Analyst | Organization |
| `REVIEWER` | Reviewer | Reviewer | Organization |
| `EMPLOYEE` | Employee | Employee | Organization |
| `VIEWER` | Viewer | Viewer | Organization |
| `GUEST` | Guest | Guest | Organization |

`resolveRoleAlias()` maps enterprise labels (Owner, Guest, …) → `AppRole` keys without breaking existing seed memberships.

## Permissions by role

| Permission | SUPER_ADMIN | ORG_ADMIN | COMPLIANCE_OFFICER | MANAGER | ANALYST | REVIEWER | EMPLOYEE | VIEWER | GUEST |
|---|---|---|---|---|---|---|---|---|---|
| `org:read` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| `org:manage` | ✓ | ✓ | | | | | | | |
| `users:read` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | | ✓ | |
| `users:manage` | ✓ | ✓ | | | | | | | |
| `roles:read` | ✓ | ✓ | ✓ | ✓ | | | | | |
| `roles:manage` | ✓ | ✓ | | | | | | | |
| `security:read` | ✓ | ✓ | ✓ | | | | | | |
| `security:manage` | ✓ | ✓ | | | | | | | |
| `cases:read` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | |
| `cases:write` | ✓ | ✓ | ✓ | ✓ | ✓ | | | | |
| `policies:read` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| `policies:write` | ✓ | ✓ | ✓ | | | | | | |
| `policies:approve` | ✓ | ✓ | ✓ | | | ✓ | | | |
| `tasks:read` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| `tasks:write` | ✓ | ✓ | ✓ | ✓ | ✓ | | ✓ | | |
| `reports:read` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | | ✓ | |
| `reports:export` | ✓ | ✓ | ✓ | ✓ | | | | | |
| `audit:read` | ✓ | ✓ | ✓ | | | ✓ | | | |
| `scim:manage` | ✓ | ✓ | | | | | | | |
| `sso:manage` | ✓ | ✓ | | | | | | | |

## Notes

- `SUPER_ADMIN` is also granted via `users.is_super_admin` (platform flag), not only membership.
- Effective permissions = role matrix ∪ grants − DENY grants (see PermissionsService).
- Legacy membership `OWNER` / `ADMIN` map to `ORG_ADMIN`.
