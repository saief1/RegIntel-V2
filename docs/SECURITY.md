# Security

## Purpose

RegIntel security posture for the NestJS API and related ops. Milestone **B5 (B023)** hardens transport headers, rate limits, password policy, secret validation, and operator audit endpoints. Architecture contract remains in [`BACKEND_ARCHITECTURE.md`](./BACKEND_ARCHITECTURE.md).

## Table of Contents

- [1. Overview](#1-overview)
- [2. Threat Model](#2-threat-model)
- [3. Authentication & Authorization](#3-authentication--authorization)
- [4. Data Protection](#4-data-protection)
- [5. Secrets Management](#5-secrets-management)
- [6. Compliance & Regulatory Requirements](#6-compliance--regulatory-requirements)
- [7. Dependency & Supply Chain Security](#7-dependency--supply-chain-security)
- [8. Incident Response](#8-incident-response)
- [9. Hardening Controls (B023)](#9-hardening-controls-b023)
- [10. Revision History](#10-revision-history)

## 1. Overview

Backend GA security baseline:

- Argon2id passwords + enterprise password policy
- JWT access + rotating refresh cookies (`httpOnly`, `SameSite=Lax`)
- MFA TOTP + trusted devices
- RBAC / permissions / org isolation
- Immutable audit trail (B017)
- Security headers, global + tenant rate limits
- Operator checklist: `GET /api/v1/security/hardening`

## 2. Threat Model

| Threat | Mitigation |
|---|---|
| Credential stuffing | Failed-login thresholds, Argon2id cost, rate limits |
| Session theft / refresh replay | Refresh rotation + family revoke on reuse |
| XSS → API abuse | CSP/nosniff/frame deny; FE sanitization; ValidationPipe whitelist |
| CSRF | Bearer JWT primary; refresh cookie not readable by JS; SameSite=Lax |
| Tenant cross-talk | `organization_id` scoping + guards + repository filters |
| Secret leakage in logs | Redaction helpers; ops endpoints omit secrets |
| Abuse / DoS (basic) | Global IP RPM + tenant RPM/daily budget |

## 3. Authentication & Authorization

- JWT access + refresh (B003); refresh rotation verified (B023 audit)
- MFA TOTP + recovery codes (B006); trusted devices (v2.2.1)
- RBAC / permissions / SSO config / SCIM (B006–B010)
- Sessions listing/revocation/logout-everywhere (v2.2.1)
- Immutable audit store delivered in **B017** (not deferred to B024; B024 is CI/CD)

## 4. Data Protection

- TLS expected at the edge (`COOKIE_SECURE=true` + HSTS in production)
- At-rest secret box (AES-256-GCM) for MFA/SSO secrets (`secret-box.util`)
- API keys: store **SHA-256 hashes only** (`hashApiKey` / `verifyApiKey`)
- PII minimization in logs; structured logger avoids dumping bodies by default

## 5. Secrets Management

- Required via env; validated at boot (`ConfigPlatformService.validateSecrets`)
- Production hard-fails on weak/placeholder JWT or MFA keys, or `COOKIE_SECURE=false`
- Never commit real secrets; use `backend/.env.example` as the template
- Config checksum covers non-secret settings only

## 6. Compliance & Regulatory Requirements

SOC 2 / GDPR applicability TBD with commercial packaging. Technical controls present: audit export, retention, RBAC, encryption helpers, tenant isolation. Formal certifications are out of band.

## 7. Dependency & Supply Chain Security

- Lockfiles committed (`package-lock.json`)
- CI runs lint/tests/build/Docker
- Prefer no new runtime deps without approval (`CLAUDE.md`); B023 headers implemented without `helmet` package

## 8. Incident Response

1. Revoke sessions (`logout-everywhere`) and rotate JWT/MFA secrets.
2. Export audit logs (`/audit-entries/export`).
3. Inspect `/ops/errors`, `/metrics`, security events.
4. Redeploy known-good image (see [`DEPLOYMENT.md`](./DEPLOYMENT.md) rollback).

## 9. Hardening Controls (B023)

| Control | Implementation |
|---|---|
| Security headers | `securityHeadersMiddleware` |
| CORS | Explicit origins + credentials |
| Global rate limit | `GlobalRateLimitMiddleware` |
| Tenant rate limit | B019 middleware |
| Input sanitization | `sanitizeText` / `sanitizeDeep` + ValidationPipe |
| Password policy | 12+ chars, upper/lower/digit/special |
| JWT/refresh | Rotation + reuse detection (existing auth) |
| API key hashing | `api-key.util.ts` |
| Encryption helpers | `secret-box.util.ts` |
| Secrets validation | Startup + production hard-fail |
| Audit endpoint | `/api/v1/security/hardening` |

## 10. Revision History

| Date | Author | Change |
|---|---|---|
| 2026-08-05 | Milestone B5 | B023 hardening baseline + operator audit |
| 2026-08-03 | Phase B planning | Point auth strategy to Backend Architecture Contract |
| TBD | TBD | Initial placeholder document created |
