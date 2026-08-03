# Database

## Purpose

This document describes RegIntel's data model, schema, storage technology, and data lifecycle policies. No database has been selected or designed yet.

## Table of Contents

- [1. Overview](#1-overview)
- [2. Technology Choice](#2-technology-choice)
- [3. Schema](#3-schema)
- [4. Entity Relationship Diagram](#4-entity-relationship-diagram)
- [5. Migrations](#5-migrations)
- [6. Data Retention & Backup](#6-data-retention--backup)
- [7. Revision History](#7-revision-history)

## 1. Overview

No schema implemented yet. **Technology and conventions are frozen** in [`BACKEND_ARCHITECTURE.md`](./BACKEND_ARCHITECTURE.md) §4. Prisma schema and migrations land in **B002**.

## 2. Technology Choice

| Item | Decision |
|---|---|
| Engine | PostgreSQL |
| ORM / migrations | Prisma |
| PKs | UUID |
| Tenancy | `organization_id` on tenant-scoped rows |
| Local | Docker Compose (`db` service) |

## 3. Schema

> Placeholder — no tables/collections defined yet.

| Table / Collection | Description | Status |
|---|---|---|
| Placeholder | TBD | Not Started |

## 4. Entity Relationship Diagram

> Placeholder — diagram to be added once schema is defined.

## 5. Migrations

> Placeholder — migration tooling and process to be defined.

## 6. Data Retention & Backup

> Placeholder — to be defined.

## 7. Revision History

| Date | Author | Change |
|---|---|---|
| 2026-08-03 | Phase B planning | Point to Backend Architecture Contract (Postgres + Prisma freeze) |
| TBD | TBD | Initial placeholder document created |
