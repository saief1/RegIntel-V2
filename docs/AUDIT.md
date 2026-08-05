# Audit Engine (B017)

## Purpose

Immutable, searchable application audit trail for authn/authz, CRUD, workflow, policy, tasks, uploads, approvals, security, and API access — with export and retention.

## Feature flag

| Flag | Default | Behavior |
|---|---|---|
| `USE_REAL_AUDIT` / `VITE_USE_REAL_AUDIT` | `false` | List API prefers legacy `audit_entries` when off; `audit_logs` + FE Audit Center platform panel when on. |

## Stores

| Table | Role |
|---|---|
| `audit_entries` | B3 legacy durable trail (still written) |
| `audit_logs` | Immutable append-only store with hash chain (`entry_hash` / `prev_hash`) |
| `audit_exports` | Export jobs (JSON/CSV) |
| `security_events` | Security Center severity stream (unchanged) |

DB triggers block `UPDATE`/`DELETE` on `audit_logs` unless `regintel.allow_audit_purge=on` (retention job only).

## Metadata captured

user, organization, timestamp, IP, user-agent, device (`X-Device-Id`), request ID, correlation ID, before/after JSON, category, entry hash.

## API (`/api/v1/audit-entries`)

| Method | Path | Notes |
|---|---|---|
| GET | `/` | List (logs when `USE_REAL_AUDIT`) |
| GET | `/logs` | Immutable logs + filters (`action`, `resource`, `category`, `userId`, `requestId`, `q`, `from`, `to`) |
| POST | `/export` | Create JSON/CSV export |
| GET | `/exports` | Prior exports |
| GET | `/retention` | Retention policy |

## Frontend

Existing **Audit & Compliance Center** (`/audit`) loads a **Platform audit log** panel when `VITE_USE_REAL_AUDIT=true`. Engagement planning UI remains mock (no redesign).

## Retention

`AUDIT_RETENTION_DAYS` (default 365). Cleanup via BullMQ `audit-cleanup` job.
