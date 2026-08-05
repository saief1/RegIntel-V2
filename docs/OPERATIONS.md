# Production Operations (B020 + B022)

## Purpose

Health/readiness/liveness probes, dependency checks, Prometheus metrics, structured logging, request/correlation IDs, OpenTelemetry stubs, config validation, env diagnostics, graceful shutdown, and (B022) health dashboard / error aggregation / timing helpers.

## Probes & ops (`/api/v1`)

| Path | Purpose |
|---|---|
| `GET /health` | Aggregated status + DB/Redis/queue/storage/email |
| `GET /liveness` | Process alive |
| `GET /readiness` | Critical deps ready |
| `GET /metrics` | Prometheus text exposition |
| `GET /ops/env` | Non-secret env diagnostics |
| `GET /ops/version` | Version / build / deployment metadata (B021) |
| `GET /ops/config` | Config checksum + feature flags (B021) |
| `GET /ops/deployment` | Deployment identity + readiness (B021) |
| `GET /ops/diagnostics` | System diagnostics (B022) |
| `GET /ops/dashboard` | Aggregated health dashboard (B022) |
| `GET /ops/errors` | In-process error aggregation (B022) |

## Dependencies checked

- PostgreSQL (`PrismaService.ping`)
- Redis / BullMQ (queue stats)
- Storage provider config
- Email provider health

## Observability

- **Structured JSON logs** via `structuredLog` with `LOG_LEVEL` gating
- **Request ID** middleware (`X-Request-Id`)
- **Correlation ID** (`X-Correlation-Id` inbound/outbound; defaults to request id)
- **Response timing** header `X-Response-Time-Ms`
- **Prometheus** counters/histograms (in-process; no prom-client dependency)
- **OpenTelemetry hooks** — `MetricsService.startSpan()` stub for future exporter
- **TimingService** — DB/queue/storage duration helpers
- **ErrorAggregator** — process-local error code tallies for `/ops/errors`

## Lifecycle

- Startup validation: `DATABASE_URL`, `REDIS_URL`, JWT secret length
- Secret validation via `ConfigPlatformService` (hard-fail in production)
- Config checksum logged at boot
- `enableShutdownHooks()` + SIGTERM/SIGINT graceful close (25s timeout)

## Local compose

`docker-compose.yml` runs Postgres 16, Redis 7, and the API with domain flags defaulted off.  
Production overlay: `docker-compose.prod.yml` (`COOKIE_SECURE=true`, `ALLOW_REGISTER=false`, healthcheck).

## Related

- Deployment platform: [`DEPLOYMENT.md`](./DEPLOYMENT.md), [`BACKEND_GA.md`](./BACKEND_GA.md)
- Security: [`SECURITY.md`](./SECURITY.md)
