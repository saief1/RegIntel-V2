# Multi-Tenant Platform (B019)

## Purpose

Hardened organization isolation, quotas, usage metering, rate limiting, seat/storage enforcement, plan metadata, and org-scoped feature flags. No cross-tenant data access.

## Tenant key

`organization_id` via authenticated membership + `X-Organization-Id` header (`OrganizationGuard`). All repository queries must include the org id.

## Data model

| Table | Role |
|---|---|
| `tenant_limits` | Plan, seats, storage, API/email daily caps, RPM, feature JSON |
| `tenant_usage` | Per-day metering (seats, storage, API, email) |
| `rate_limits` | In-DB sliding window counters (Redis preferred later) |
| `feature_flags` | Global or org-scoped toggles |

Plans: `FREE`, `STARTER`, `PROFESSIONAL`, `ENTERPRISE`.

## Enforcement

- **Rate limit middleware** — when `X-Organization-Id` present (skips health/metrics)
- **Seat validation** — `assertSeatAvailable`
- **Storage quotas** — `assertStorageAllowed`
- **API throttling** — daily budget + per-minute RPM
- **Audit tenant context** — org id on every audit write

## API (`/api/v1/tenancy`)

| Method | Path | Notes |
|---|---|---|
| GET | `/context` | Plan, limits, usage |
| PATCH | `/limits` | Update quotas/plan |
| POST | `/feature-flags` | Upsert org flag |

## Isolation guarantee

Requests with a foreign `X-Organization-Id` receive `403 ORG_ACCESS_DENIED`. Domain repositories never query without org scope.
