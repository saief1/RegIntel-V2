# RegIntel API (Milestone B1)

NestJS + PostgreSQL + Prisma backend for RegIntel. Follows [`docs/BACKEND_ARCHITECTURE.md`](../docs/BACKEND_ARCHITECTURE.md).

## Prerequisites

- Node.js 22+
- Docker & Docker Compose **(preferred)**, **or** local PostgreSQL 16 + Redis 7

## Quick start (Docker Compose)

From the repository root:

```bash
docker compose up --build
```

- API: `http://localhost:3000/api/v1`
- Health: `http://localhost:3000/api/v1/health`
- Swagger: `http://localhost:3000/api/docs`
- OpenAPI JSON: `http://localhost:3000/api/docs-json`

Seeded admin (Compose / `.env.example`):

- Email: `admin@regintel.local`
- Password: `ChangeMeAdmin123!`

## Local development (without Docker API container)

```bash
cd backend
cp .env.example .env
# Ensure DATABASE_URL and REDIS_URL point at local services
npm install
npx prisma migrate deploy
npx prisma db seed
npm run start:dev
```

### Migrate / seed / rollback

| Action | Command |
|---|---|
| Create migration | `npx prisma migrate dev --name <name>` |
| Apply (deploy) | `npx prisma migrate deploy` |
| Seed | `npx prisma db seed` |
| Reset local DB | `npx prisma migrate reset` (destructive; local only) |
| Rollback (shared envs) | Ship a **forward** corrective migration; restore from backup if needed. Do not rewrite applied migration history. |

See Architecture Contract §5 for the full migration policy.

## Scripts

| Script | Purpose |
|---|---|
| `npm run start:dev` | Watch mode |
| `npm run build` | Compile |
| `npm run lint` | ESLint |
| `npm test` | Unit tests |
| `npm run test:e2e` | API e2e (requires `DATABASE_URL`) |
| `npm run verify:openapi` | Smoke health + OpenAPI paths |

## Core routes (`/api/v1`)

| Method | Path | Notes |
|---|---|---|
| GET | `/health` | Liveness + DB check |
| POST | `/auth/register` | When `ALLOW_REGISTER=true` |
| POST | `/auth/login` | Sets httpOnly refresh cookie |
| POST | `/auth/refresh` | Cookie rotation |
| POST | `/auth/logout` | Revoke + clear cookie |
| GET/PATCH | `/users/me` | Bearer required |
| GET/POST | `/organizations` | Bearer required |
| GET | `/organizations/:id` | Bearer + `X-Organization-Id` |

## Auth model

- Access: JWT Bearer (`Authorization: Bearer …`), TTL `15m`
- Refresh: httpOnly cookie `refresh_token` on path `/api/v1/auth`
- Passwords: Argon2id
- MFA / OIDC / SAML: interfaces stubbed only

## Feature flags (frontend)

Defaults **false**. See `src/config/featureFlags.ts`:

```
VITE_USE_REAL_AUTH=false
VITE_USE_REAL_KNOWLEDGE=false
VITE_USE_REAL_TASKS=false
VITE_USE_REAL_REPORTS=false
VITE_USE_REAL_POLICIES=false
VITE_USE_REAL_NOTIFICATIONS=false
VITE_USE_REAL_CASES=false
VITE_API_BASE_URL=http://localhost:3000/api/v1
```
