# Object Storage

## Purpose

Documents RegIntel’s object storage abstraction for evidence attachments, policy documents, images, and report artifacts. Introduced in **Milestone B3 (v2.3.0 / B013)**.

## Table of Contents

- [1. Overview](#1-overview)
- [2. Provider selection](#2-provider-selection)
- [3. Local provider](#3-local-provider)
- [4. Cloud providers (stubs)](#4-cloud-providers-stubs)
- [5. API surface](#5-api-surface)
- [6. Validation & virus scan](#6-validation--virus-scan)
- [7. Metadata model](#7-metadata-model)
- [8. Revision history](#8-revision-history)

## 1. Overview

Storage is accessed only through the `StorageProvider` interface (`backend/src/modules/storage/storage.types.ts`). Controllers call `StorageService`, which uses repositories for metadata and the configured provider for bytes.

| Capability | Status |
|---|---|
| Upload / download / delete | ✅ |
| Signed URLs | ✅ (local tokenized path; cloud stubs fall back) |
| Version metadata | ✅ (`version_label` on `storage_objects`) |
| Attachments (polymorphic owner) | ✅ (`attachments.owner_type` + `owner_id`) |
| Virus scan | Hook placeholder (`NoopVirusScanHook` → `pending`) |

## 2. Provider selection

| Env | Default | Notes |
|---|---|---|
| `STORAGE_PROVIDER` | `local` | `local` \| `s3` \| `azure` \| `gcs` |
| `STORAGE_LOCAL_ROOT` | `./storage` | On-disk root for Local (and cloud fallback) |
| `USE_REAL_STORAGE` / `VITE_USE_REAL_STORAGE` | `false` | FE cutover flag (UI unchanged) |

Feature flags default **false**. Backend Local storage always works in development regardless of FE flags.

## 3. Local provider

Fully implemented. Files are written under `{STORAGE_LOCAL_ROOT}/{objectKey}/v-{versionLabel}`. Signed URLs return `/api/v1/storage/signed/{token}` with an expiry claim.

## 4. Cloud providers (stubs)

`S3`, `Azure Blob`, and `GCS` are interface-compatible stubs. When credentials are absent (or SDKs not wired), they **fall back to Local** and log a warning. Credential env hints:

- S3: `AWS_ACCESS_KEY_ID`, `AWS_S3_BUCKET`
- Azure: `AZURE_STORAGE_CONNECTION_STRING` or `AZURE_STORAGE_ACCOUNT`
- GCS: `GCS_BUCKET` + `GOOGLE_APPLICATION_CREDENTIALS` / `GCS_CLIENT_EMAIL`

No new cloud SDKs are installed in B3.

## 5. API surface

All under `/api/v1/storage` with JWT + `X-Organization-Id`:

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/storage` | List objects (paginated) |
| `POST` | `/storage/upload` | Multipart upload (+ optional attachment link) |
| `GET` | `/storage/:id` | Metadata |
| `GET` | `/storage/:id/download` | Bytes |
| `GET` | `/storage/:id/signed-url` | Short-lived URL |
| `DELETE` | `/storage/:id` | Soft-delete metadata + remove bytes |
| `GET` | `/storage/attachments/:ownerType/:ownerId` | Attachments for a domain owner |

## 6. Validation & virus scan

- Max size: 25 MiB
- Allowed MIME: PDF, JSON, text/markdown/csv, PNG/JPEG/WebP, OOXML, octet-stream
- Virus scan: `VirusScanHook.scan()` — noop returns `pending` until a real scanner is plugged in

## 7. Metadata model

See [`DATABASE.md`](./DATABASE.md): `storage_objects`, `attachments`. Soft delete via `deleted_at`.

## 8. Revision history

| Date | Author | Change |
|---|---|---|
| 2026-08-04 | Milestone B3 | Initial STORAGE.md (B013 Local + cloud stubs) |
