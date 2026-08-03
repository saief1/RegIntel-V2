# Architecture

## Purpose

Describes RegIntel's architecture at **v2.0.0 Frontend Platform GA**, and how it differs from the future full-stack SaaS.

## Table of Contents

- [1. Positioning](#1-positioning)
- [2. Frontend Platform (GA)](#2-frontend-platform-ga)
- [3. What Is Not Yet Built](#3-what-is-not-yet-built)
- [4. Layering](#4-layering)
- [5. Design System Paths](#5-design-system-paths)
- [6. Routing & Code Splitting](#6-routing--code-splitting)
- [7. Error & Empty States](#7-error--empty-states)
- [8. Post-GA Evolution](#8-post-ga-evolution)
- [9. Related Documents](#9-related-documents)

## 1. Positioning

**v2.0.0 is the Frontend Platform GA**, not a finished multi-tenant SaaS.

| Capability | v2.0.0 GA | Future |
|---|---|---|
| App shell, nav (≤6), workspace | ✅ | Evolve |
| Design system + tokens | ✅ | Phase A ✅ (v2.0.1); continue opportunistic cleanup |
| Module UIs (Work, Knowledge, AI, Reports, Settings, …) | ✅ mock-backed | Phase B wire APIs |
| Real auth / SSO | ❌ | Phase B |
| Persistence / multi-tenant DB | ❌ | Phase B |
| Live integrations | ❌ mock connectors | Phase B |
| Production AI orchestration | ❌ demo assistants | Phase C |
| Live billing / licensing | ❌ mock commercial UI | Phase D–F / v3.0 |
| Enterprise integrations (live) | ❌ mock connectors | Phase E |
| Pilot customers | ❌ | Phase F |

## 2. Frontend Platform (GA)

```
Browser
  └── React 19 + TypeScript + Vite
        ├── AppShell (Header, Sidebar, Workspace, AI Panel)
        ├── React Router (lazy route chunks + Suspense)
        ├── Context providers (domain mock state)
        ├── pages/* (feature surfaces)
        ├── components/ui/* (design system)
        └── styles/tokens/* (spacing, color, type, motion)
```

- **State:** in-memory React context + seeded mock data under `src/data/`
- **No backend process** in this repository for GA
- **Primary nav:** Home, AI Workspace, Library, Work, Reports, Settings (max 6)

## 3. What Is Not Yet Built

Do not treat mock providers, fake sync queues, or demo AI replies as production services. They exist to exercise UX, information architecture, and workflows ahead of Phases B–D.

## 4. Layering

| Layer | Location | Responsibility |
|---|---|---|
| Tokens | `src/styles/tokens/` | Color, space, type, radius, shadow, motion |
| UI primitives | `src/components/ui/` | Button, Badge, Card, Modal, Table, EmptyState, … |
| Layout | `src/components/layout/` | AppShell, Sidebar, Header, Workspace |
| Domain UI | `src/components/{work,knowledge,…}/` | Feature-specific composables |
| Pages | `src/pages/` | Route-level composition |
| Domain state | `src/context/` + `src/hooks/` | Mock providers / hooks |
| Utils | `src/utils/` | Pure helpers (search, dates, diffs) |

Prefer **composition of UI primitives** over page-local one-off controls.

## 5. Design System Paths

**Canonical components (use these going forward):**

| Concern | Path |
|---|---|
| Button | `components/ui/Button` |
| Badge | `components/ui/Badge` |
| Card / Panel | `components/ui/Card`, `components/ui/Panel` |
| Modal / Confirm | `components/ui/Modal`, `components/ui/ConfirmDialog` |
| Table | `components/ui/Table` |
| Empty / network | `components/ui/EmptyState`, `components/ui/NetworkErrorState` |
| Loading | `components/ui/Skeleton`, `layout/RouteFallback` |
| Page chrome | `PageContainer`, `PageHeader`, `SectionHeader`, `Toolbar` |

Domain CSS modules (e.g. `governance.module.css`) may style layout density but should not fork Button/Badge/Modal.

See [`UI_GUIDELINES.md`](./UI_GUIDELINES.md) for Frontend Platform GA notes and audit findings.

## 6. Routing & Code Splitting

- All feature routes are `React.lazy` + `Suspense` with `RouteFallback`
- Eager exceptions: shell chrome, `HomePage`, `ComingSoonPage`, `NotFoundPage`
- New routes **must** stay lazy

## 7. Error & Empty States

| Pattern | Component |
|---|---|
| Uncaught render errors | `ErrorBoundary` (wraps app in `main.tsx`) |
| 404 | `NotFoundPage` |
| Empty lists / filters | `EmptyState` (+ domain presets like `EmptyKnowledgeState`) |
| Offline / API failure (future) | `NetworkErrorState` |

## 8. Post-GA Evolution

Phases A–F (and v3.0 Commercial Launch) are documented in [`ROADMAP.md`](./ROADMAP.md). Ticket IDs (`A001`–`F015`) are the planning source of truth. Architecture changes that introduce new frameworks, data layers, or folder conventions require approval per `CLAUDE.md`.

**Phase B backend:** conventions, tech freeze, and `backend/` layout are defined in [`BACKEND_ARCHITECTURE.md`](./BACKEND_ARCHITECTURE.md). Frontend stays at repo root; UI frozen except mock→API feature-flag wiring. No NestJS scaffolding until B001.

## 9. Related Documents

- [`MASTER_SPEC.md`](./MASTER_SPEC.md)
- [`BACKEND_ARCHITECTURE.md`](./BACKEND_ARCHITECTURE.md)
- [`UI_GUIDELINES.md`](./UI_GUIDELINES.md)
- [`RELEASE_NOTES.md`](./RELEASE_NOTES.md)
- [`ROADMAP.md`](./ROADMAP.md)
