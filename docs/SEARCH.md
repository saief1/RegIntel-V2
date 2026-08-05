# Search Indexing Platform (B018)

## Purpose

Tenant-scoped search across policies, knowledge/documents, tasks, cases, reports, notifications, users, and organizations — with highlighting, pagination, and ranking. Abstraction is ready for Elasticsearch/OpenSearch; v1 uses PostgreSQL `search_documents`.

## Feature flag

| Flag | Default | Behavior |
|---|---|---|
| `USE_REAL_SEARCH` / `VITE_USE_REAL_SEARCH` | `false` | FE helpers available; UI not redesigned. API always available for backend consumers. |

## Provider

`SEARCH_PROVIDER=postgres` (default). Future: `elasticsearch` / `opensearch` behind the same repository interface.

## Indexing

- **Incremental** — last-24h domain updates
- **Rebuild** — full org reindex (`POST /search/rebuild` enqueues BullMQ `search-index`)
- Entity types: `POLICY`, `KNOWLEDGE`, `DOCUMENT`, `TASK`, `CASE`, `REPORT`, `COMMENT`, `NOTIFICATION`, `USER`, `ORGANIZATION`

## API (`/api/v1/search`)

| Method | Path | Notes |
|---|---|---|
| GET | `/` | Query (`q`, `types`, `page`, `pageSize`) — returns highlights + rank |
| POST | `/rebuild` | Enqueue rebuild |
| POST | `/rebuild/sync` | Synchronous rebuild (ops/dev) |
| GET | `/stats` | Document count + provider |

## Ranking

Title matches weight higher than body matches; per-document `rank_boost` applies. Highlights wrap matches in `<mark>`.
