# Release Notes

## RegIntel v2.0.0 — Frontend Platform GA

**Date:** 2026-08-03  
**Tags:** `v2.0.0`, `SPRINT20_COMPLETE`  
**Sprint:** 20 (Release Candidate / GA Hardening)

### Headline

RegIntel **v2.0.0** marks **Frontend Platform GA**: a production-ready enterprise UI platform with a complete module surface (Sprints 1–19), shared design system, route-level code splitting, and hardened error/empty/loading patterns.

> **Important:** v2.0.0 is **not** a finished SaaS product. Real authentication, persistence, live integrations, production AI orchestration, and live billing are **explicitly out of scope** for this release and belong to post-GA Phases B–D.

### What GA includes

- App shell with ≤6 primary nav items and secondary destinations
- Design tokens + shared UI primitives (Button, Badge, Card, Modal, Table, EmptyState, …)
- Lazy-loaded feature routes across Work, Knowledge, AI, Reports, Settings, Operations, Developer, Solutions, Commercial, and more
- Global React `ErrorBoundary` with recover actions
- `NetworkErrorState` for future API/offline surfaces (demoed on Integrations)
- Playwright smoke coverage across core routes and viewports (incl. 404)
- Documentation framing for Phases A–D (no Sprint 21+)

### What GA does **not** include

- Real user auth / SSO / session management
- Database persistence or multi-tenant isolation
- Live third-party integrations or webhooks
- Production LLM / agent orchestration
- Live Stripe (or equivalent) billing and entitlement enforcement

### Upgrade notes

- `package.json` version is `2.0.0`
- Mock data and in-memory providers remain the source of truth until Phase B
- Continue using design-system paths documented in [`ARCHITECTURE.md`](./ARCHITECTURE.md)

### Next

See [`ROADMAP.md`](./ROADMAP.md):

1. **Phase A** — Platform Stabilization  
2. **Phase B** — Backend Platform  
3. **Phase C** — AI Intelligence Layer  
4. **Phase D** — Wealth Management Launch  

### Prior beta line

v1.0.0-beta through v1.9.0-beta delivered the module ladder (Autonomous Compliance → Commercial Platform). v2.0.0 hardens that frontend platform for GA without adding new business modules.
