# Production Operations (B020)

## Purpose

Health/readiness/liveness probes, dependency checks, Prometheus metrics, structured logging, request/correlation IDs, OpenTelemetry stubs, config validation, env diagnostics, and graceful shutdown.

## Probes (`/api/v1`)

| Path | Purpose |
|---|---|
| `GET /health` | Aggregated status + DB/Redis/queue/storage/email |
| `GET /liveness` | Process alive |
| `GET /readiness` | Critical deps ready |
| `GET /metrics` | Prometheus text exposition |
| `GET /ops/env` | Non-secret env diagnostics |

## Dependencies checked

- PostgreSQL (`PrismaService.ping`)
- Redis / BullMQ (queue stats)
- Storage provider config
- Email provider health

## Observability

- **Structured JSON logs** via `structuredLog`
- **Request ID** middleware (`X-Request-Id`)
- **Correlation ID** (`X-Correlation-Id` inbound/outbound)
- **Prometheus** counters/histograms (in-process; no prom-client dependency)
- **OpenTelemetry hooks** — `MetricsService.startSpan()` stub for future exporter

## Lifecycle

- Startup validation: `DATABASE_URL`, `REDIS_URL`, JWT secret length
- `enableShutdownHooks()` + SIGTERM/SIGINT graceful close

## Local compose

`docker-compose.yml` runs Postgres 16, Redis 7, and the API with B4 flags defaulted off.
