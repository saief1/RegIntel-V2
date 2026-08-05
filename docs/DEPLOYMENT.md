# Deployment

## Purpose

How RegIntel is built, configured, and operated. Milestone **B5 (v2.5.0)** establishes a production deployment platform (B021) and CI/CD scaffolding (B024). Hosting provider selection remains open — deploy/rollback workflows are intentional placeholders.

## Table of Contents

- [1. Overview](#1-overview)
- [2. Environments](#2-environments)
- [3. Build Process](#3-build-process)
- [4. CI/CD Pipeline](#4-cicd-pipeline)
- [5. Hosting & Infrastructure](#5-hosting--infrastructure)
- [6. Environment Variables & Configuration](#6-environment-variables--configuration)
- [7. Monitoring & Observability](#7-monitoring--observability)
- [8. Rollback Strategy](#8-rollback-strategy)
- [9. Revision History](#9-revision-history)

## 1. Overview

| Component | Artifact |
|---|---|
| API | NestJS in `backend/`; image via `backend/Dockerfile` |
| Data | PostgreSQL 16 (Prisma migrations) |
| Queue | Redis 7 + BullMQ |
| Frontend | Vite SPA (static hosting; separate from API image) |
| Local stack | `docker-compose.yml` (+ optional `docker-compose.prod.yml`) |

Authoritative readiness: [`BACKEND_GA.md`](./BACKEND_GA.md).

## 2. Environments

| Environment | Purpose | Status |
|---|---|---|
| Local | `docker compose up` / `npm run backend:dev` | Active |
| CI | GitHub Actions | Active (`.github/workflows/ci.yml`) |
| Staging | TBD host | Placeholder deploy workflow |
| Production | TBD host | Placeholder; secret validation hard-fails on weak secrets |

## 3. Build Process

**API**

```bash
cd backend
npm ci
npx prisma generate
npm run build          # nest build → dist/
npm run start:prod     # node dist/main.js
```

**Docker**

```bash
docker build \
  --build-arg APP_VERSION=2.5.0 \
  --build-arg GIT_SHA=$(git rev-parse HEAD) \
  --build-arg BUILD_TIME=$(date -u +%Y-%m-%dT%H:%M:%SZ) \
  -t regintel-api:2.5.0 ./backend
```

Entrypoint runs `prisma migrate deploy`, optional seed, then starts the API. Container runs as non-root `regintel`.

**Frontend**

```bash
npm ci
npm run build   # tsc -b && vite build → dist/
```

## 4. CI/CD Pipeline

| Workflow | Trigger | Jobs |
|---|---|---|
| `ci.yml` | push/PR | Backend lint/test/build/openapi; frontend lint/build; Playwright; Docker build; migration validation; version alignment |
| `release.yml` | tag `v*` | Tag↔version check; release notes hook; artifact package; **deploy placeholder** |
| `deploy-placeholder.yml` | `workflow_dispatch` | Manual deploy/rollback stubs (no infra mutated) |

## 5. Hosting & Infrastructure

Not pinned. Compose is the reference topology:

- `db` — Postgres 16
- `redis` — Redis 7
- `api` — Nest API

Production overlay sets `NODE_ENV=production`, `COOKIE_SECURE=true`, `ALLOW_REGISTER=false`, and a liveness healthcheck.

## 6. Environment Variables & Configuration

See `backend/.env.example`. Critical:

| Variable | Notes |
|---|---|
| `DATABASE_URL` / `DIRECT_URL` | Required |
| `REDIS_URL` | Required |
| `JWT_ACCESS_SECRET` | ≥32 chars; no `change-me` in production |
| `MFA_ENCRYPTION_KEY` | ≥32 chars |
| `CORS_ORIGINS` | Comma-separated |
| `COOKIE_SECURE` | Must be `true` in production |
| `APP_VERSION` / `GIT_SHA` / `BUILD_TIME` / `DEPLOYMENT_ID` | Build metadata |
| `USE_REAL_*` | Domain cutover flags (default `false`) |

Runtime surfaces: `GET /api/v1/ops/config`, `/ops/version`, `/ops/deployment`. Config checksum is logged at startup.

## 7. Monitoring & Observability

See [`OPERATIONS.md`](./OPERATIONS.md). Minimum scrape targets: `/api/v1/metrics`, `/api/v1/health`, `/api/v1/readiness`.

## 8. Rollback Strategy

1. Retain previous image digests / Compose tags.
2. Redeploy prior image; run migrations forward-only (avoid down migrations unless explicitly approved).
3. Confirm `/readiness` + `/ops/deployment`.
4. Automate via `deploy-placeholder.yml` once host is chosen.

## 9. Revision History

| Date | Author | Change |
|---|---|---|
| 2026-08-05 | Milestone B5 | Production deployment platform + CI/CD placeholders |
| TBD | TBD | Initial placeholder document created |
