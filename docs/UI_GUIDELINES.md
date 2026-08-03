# UI Guidelines

## Purpose

Defines RegIntel's design language, component conventions, and UX principles. Target language: Apple Human Interface Guidelines clarity, Linear density/speed, Harvey AI professional trust (see [`CLAUDE.md`](../CLAUDE.md)).

## Frontend Platform GA (v2.0.0)

As of Sprint 20, the frontend design system is **GA for platform use**:

- Tokens live in `src/styles/tokens/` (color, spacing, typography, radius, shadow, motion, layout, z-index)
- Primitives live in `src/components/ui/`
- New UI **must** prefer those primitives; do not introduce parallel Button/Badge/Card/Modal/Table implementations
- Loading → `Skeleton` / `RouteFallback`
- Empty → `EmptyState` (or domain presets such as `EmptyKnowledgeState`)
- Network / offline (future APIs) → `NetworkErrorState`
- Fatal render errors → app-level `ErrorBoundary`
- Primary navigation remains **≤6 items**

Full mechanical unification of every historical page-level style is **Phase A** work. GA documents the canonical paths and fixes high-value inconsistencies only.

### Design system audit (Sprint 20)

| Finding | Severity | GA action |
|---|---|---|
| Canonical Button/Badge/Card/Modal/Table/EmptyState exist and are widely used | — | Confirmed; document as required paths |
| Domain layout CSS (`governance.module.css`, `connected.module.css`, etc.) duplicates card/panel density | Medium | Document; unify in Phase A — do not rewrite all pages in GA |
| Some pages still use local link/button chrome | Low | Fix when touching those surfaces (Not Found → Button) |
| Knowledge routes were eager while others lazy | Medium | Fixed in GA |
| No global error boundary | High | Fixed in GA |
| Network/offline empty pattern missing | Medium | `NetworkErrorState` added |
| Placeholder docs for tokens/components | Medium | This GA section + [`ARCHITECTURE.md`](./ARCHITECTURE.md) |

**Going forward:** single path for Button, Badge, Card, Modal, Table, typography tokens (`--ri-font-*`), and spacing tokens (`--ri-space-*`).

## Table of Contents

- [1. Design Principles](#1-design-principles)
- [2. Design References](#2-design-references)
- [3. Color System](#3-color-system)
- [4. Typography](#4-typography)
- [5. Spacing & Layout](#5-spacing--layout)
- [6. Components](#6-components)
- [7. Iconography](#7-iconography)
- [8. Accessibility](#8-accessibility)
- [9. Motion & Interaction](#9-motion--interaction)
- [10. Revision History](#10-revision-history)

## 1. Design Principles

- **Clarity over decoration** — calm surfaces, purposeful hierarchy
- **Density with breathing room** — Linear-like information density using the spacing scale
- **Trustworthy professionalism** — Harvey-like restraint; no playful chrome
- **Honest states** — empty, loading, and error are first-class (never fake “enterprise done”)
- **Composition** — prefer shared primitives over one-off widgets

## 2. Design References

- **Apple HIG** — focus, clarity, predictable controls
- **Linear** — speed, density, keyboard-forward patterns (e.g. ⌘K)
- **Harvey AI** — professional legal/compliance tone and visual restraint

## 3. Color System

Defined in `src/styles/tokens/color.css`.

- Mostly monochrome neutrals + purple accent (`#6D5EF6`)
- Color for meaning (success / warning / error / info)
- Prefer semantic tokens (`--ri-color-text-primary`, `--ri-color-accent`, …) over palette primitives in components

## 4. Typography

Defined in `src/styles/tokens/typography.css`.

- Sans: Inter / system stack via `--ri-font-family-sans`
- Use heading/body/caption size tokens; avoid ad-hoc `font-size` literals

## 5. Spacing & Layout

Defined in `src/styles/tokens/spacing.css` and `layout.css`.

- Scale is 4px multiples: `--ri-space-1` … `--ri-space-24`
- Page chrome via `PageContainer` + `PageHeader`
- Shell workspace is the single scroll/content region (`aria-label="Workspace"`)

## 6. Components

| Use | Component |
|---|---|
| Actions | `Button`, `IconButton` |
| Status chips | `Badge` |
| Surfaces | `Card`, `Panel` |
| Dialogs | `Modal`, `ConfirmDialog` |
| Data grids | `Table` |
| Forms | `Input`, `Select`, `Textarea`, `SearchField` |
| Empty | `EmptyState`, `NetworkErrorState` |
| Loading | `Skeleton`, `RouteFallback` |
| Structure | `PageContainer`, `PageHeader`, `SectionHeader`, `Toolbar`, `Divider` |

See [`ARCHITECTURE.md`](./ARCHITECTURE.md) § Design System Paths.

## 7. Iconography

- `lucide-react` only
- Decorative icons: `aria-hidden="true"`
- Icon-only controls: required `aria-label` via `IconButton`

## 8. Accessibility

- Target: practical WCAG 2.2 AA on surfaces we ship/touch
- Modals: `role="dialog"`, `aria-modal`, focus trap, Escape to dismiss
- Announce loading/empty with `role="status"` where appropriate
- Fatal errors: `role="alert"` via `ErrorBoundary`
- Prefer real buttons/links; avoid unlabeled `<label>` on non-controls
- Keyboard: command palette, dialogs, primary nav

## 9. Motion & Interaction

- Prefer `--ri-transition-hover` and motion tokens
- Motion for hierarchy/presence, not noise
- Respect reduced-motion in future Phase A polish if not already covered

## 10. Revision History

| Date | Author | Change |
|---|---|---|
| 2026-08-03 | Sprint 20 | Frontend Platform GA notes, audit table, canonical component paths |
| TBD | TBD | Initial placeholder document created |
