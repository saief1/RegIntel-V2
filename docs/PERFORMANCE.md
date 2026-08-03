# Performance Notes (Phase A — A002)

## Scope

Pragmatic frontend-platform pass after v2.0.0 GA. No new dependencies. Goal: document findings and ship safe wins, not a full perf rewrite.

## Findings

| Area | Status | Notes |
|---|---|---|
| Route code-splitting | Good | Feature pages are lazy in `src/router.tsx`. Phase A also lazy-loads `NotFoundPage` and `ComingSoonPage`. |
| Main / shell chunk | Large | Vite build reports ~600KB+ for the entry chunk. Driven by eager shell providers (`AppShell`), command palette, AI panel, and shared contexts. **Deferred to Phase B** (when data layer splits naturally) rather than risky provider refactoring now. |
| AI Workspace chunk | Moderate | Largest lazy page (~40KB JS + CSS). Acceptable for a dense workspace; further panel splitting deferred. |
| Dead imports | Cleaned opportunistically | No systematic dead-code elimination tool added (would require new deps). |
| Re-renders | Low risk | No obvious hot-path anti-patterns found on key Work/Cases surfaces in this pass. Avoid adding `useMemo`/`useCallback` unless measured. |

## Actions taken in Phase A

- Lazy `NotFoundPage` / `ComingSoonPage`
- Confirmed existing route-level `Suspense` + `RouteFallback`
- Documented shell-chunk deferral (above)

## Deferred (Phase B+)

- Split provider tree / lazy shell adjuncts once real API clients exist
- Bundle analyzer in CI (requires approved tooling)
- Performance budgets tied to staging with real network
