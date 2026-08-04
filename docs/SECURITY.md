# Security

## Purpose

This document defines RegIntel's security posture, threat model, and compliance requirements. As an enterprise SaaS, security policy must be established before handling any real customer or regulatory data.

## Table of Contents

- [1. Overview](#1-overview)
- [2. Threat Model](#2-threat-model)
- [3. Authentication & Authorization](#3-authentication--authorization)
- [4. Data Protection](#4-data-protection)
- [5. Secrets Management](#5-secrets-management)
- [6. Compliance & Regulatory Requirements](#6-compliance--regulatory-requirements)
- [7. Dependency & Supply Chain Security](#7-dependency--supply-chain-security)
- [8. Incident Response](#8-incident-response)
- [9. Revision History](#9-revision-history)

## 1. Overview

> Placeholder — to be defined.

## 2. Threat Model

> Placeholder — to be defined.

## 3. Authentication & Authorization

Phase B direction is frozen in [`BACKEND_ARCHITECTURE.md`](./BACKEND_ARCHITECTURE.md): JWT access + refresh, Argon2. Milestone **B2** implements TOTP MFA (+ recovery codes), DB-driven RBAC/permissions, SSO OIDC/SAML configuration interfaces (mock IdPs), and SCIM provisioning REST. **v2.2.1** adds session listing/revocation/logout-everywhere, idle timeout on refresh, MFA trusted devices (“remember browser”), login/password history, persisted security events, and suspicious failed-login hooks. Real Okta/Azure IdP wiring remains behind SSO interfaces. Full immutable audit store remains **B024**.

## 4. Data Protection

> Placeholder — encryption at rest / in transit, PII handling, to be defined.

## 5. Secrets Management

> Placeholder — to be defined.

## 6. Compliance & Regulatory Requirements

> Placeholder — e.g. SOC 2, GDPR, HIPAA applicability to be determined given the "RegIntel" regulatory-intelligence domain.

## 7. Dependency & Supply Chain Security

> Placeholder — to be defined.

## 8. Incident Response

> Placeholder — to be defined.

## 9. Revision History

| Date | Author | Change |
|---|---|---|
| 2026-08-03 | Phase B planning | Point auth strategy to Backend Architecture Contract |
| TBD | TBD | Initial placeholder document created |
