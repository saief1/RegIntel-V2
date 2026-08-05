# Email Platform (B016)

## Purpose

Enterprise email delivery for RegIntel: provider abstraction, system templates, BullMQ queueing, retry, delivery logging, and webhook placeholder.

## Feature flag

| Flag | Default | Behavior |
|---|---|---|
| `USE_REAL_EMAIL` / `VITE_USE_REAL_EMAIL` | `false` | When false, sends use the **console** provider (logs to structured output). When true, uses `EMAIL_PROVIDER`. |

## Providers

| Provider | Env | Status |
|---|---|---|
| `console` | (default) | Works without external keys |
| `smtp` | `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_SECURE` | Minimal SMTP client (no extra dependency) |
| `resend` | `RESEND_API_KEY` | HTTP API |
| `sendgrid` | `SENDGRID_API_KEY` | HTTP API |
| `ses` | `AWS_SES_REGION` | Stub (interface-ready; AWS SDK not approved) |

## Templates

System templates (seeded on boot): `welcome`, `password_reset`, `mfa`, `invitation`, `task_assignment`, `approval`, `policy_review_reminder`, `daily_digest`, `weekly_digest`, `security_alert`.

Variables use `{{name}}` Mustache-style substitution.

## Data model

- `email_templates` — system + optional org overrides
- `email_deliveries` — queue/delivery log (`QUEUED` → `SENDING` → `SENT`/`FAILED`)

## API (`/api/v1/email`)

| Method | Path | Notes |
|---|---|---|
| GET | `/templates` | List templates |
| GET | `/deliveries` | Delivery log (paginated) |
| POST | `/send` | Queue templated email |
| POST | `/webhooks/:provider` | Delivery webhook placeholder |
| GET | `/health` | Provider readiness |

## Queue

BullMQ queue `email` with exponential backoff (5 attempts). Payload may include `deliveryId` for durable status updates.
