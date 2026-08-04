# Product Board

Mirror of the Product Board in [`ROADMAP.md`](./ROADMAP.md). **ROADMAP.md is authoritative** — update both when phase status changes.

| Phase | Status | Progress |
|---|---|---|
| Frontend Platform GA (v2.0.0) | ✅ Complete | 100% |
| Phase A – Stabilization | ✅ Complete | 100% |
| Phase B – Backend Platform | 🔄 In Progress | ~60% (B000–B015 ✅ + v2.2.1; next B016+) |
| Phase C – AI Intelligence Layer | ⏳ Planned | 0% |
| Phase D – Wealth Management Production | ⏳ Planned | 0% |
| Phase E – Enterprise Integrations | ⏳ Planned | 0% |
| Phase F – Pilot Customers | ⏳ Planned | 0% |
| RegIntel v3.0 Commercial Launch | ⏳ Planned | 0% |

## Current step

**B016+** — Email delivery & platform deepening (immutable audit, org structure, workflow hardening, multi-tenancy).

Milestone B3 complete: **v2.3.0** / `MILESTONE_B3_COMPLETE` (B011–B015 Data Layer & Notifications).  
Milestone B2 complete: **v2.2.0** / `B2_COMPLETE` (B006–B010).  
Sessions gap-fill: **v2.2.1** / `B2_SESSIONS_COMPLETE`.  
Milestone B1: **v2.1.0** / `MILESTONE_B1_COMPLETE`.  
Architecture Contract: [`BACKEND_ARCHITECTURE.md`](./BACKEND_ARCHITECTURE.md) ✅.

UI frozen except integration wiring. Domain FE providers remain mock-default (`VITE_USE_REAL_*` false).

## Version targets

| Version | Milestone |
|---|---|
| v2.0.x | Frontend Platform + Stabilization ✅ |
| v2.1.0 | Backend Foundation (B001–B005) ✅ |
| v2.2.0 | Identity & Access (B006–B010) ✅ |
| v2.2.1 | Identity & Sessions Completeness ✅ |
| v2.3.0 | Data Layer & Notifications (B011–B015) ✅ |
| v2.4.0 | Platform Deepening (B016–B020) |
| v2.5.0 | Backend Platform Beta |
| v2.7.0 | AI Intelligence Beta |
| v2.9.0 | Wealth Management Beta |
| v3.0.0 | Commercial GA |

## Tree

```
RegIntel v2.x Frontend Platform GA (v2.0.0)
→ Phase A Platform Stabilization (A001–A010) ✅ v2.0.1
→ Phase B Backend Platform (B000–B025) 🔄
    → B000 Architecture Contract ✅
    → B001–B005 Foundation → v2.1.0 ✅
    → B006–B010 Identity & access → v2.2.0 ✅
    → v2.2.1 Sessions / Security Center gap-fill ✅
    → B011–B015 Data Layer & Notifications → v2.3.0 ✅
    → B016–B020 Platform Deepening → v2.4.0 (email, audit, org structure, workflows, tenancy)
    → B021–B025 Backend Beta hardening → v2.5.0
→ Phase C AI Intelligence Layer (C001–C020) → v2.7.0
→ Phase D Wealth Management Production (D001–D020) → v2.9.0
→ Phase E Enterprise Integrations (E001–E015)
→ Phase F Pilot Customers (F001–F015)
→ RegIntel v3.0 Commercial Launch
```

## Phase B ticket bands

| Band | IDs | Theme | Status |
|---|---|---|---|
| Contract | B000 | Backend Architecture Contract | ✅ |
| B1 Foundation | B001–B005 | Scaffolding, auth, user/org, Prisma, API + OpenAPI | ✅ v2.1.0 |
| Identity & access | B006–B010 | MFA, RBAC, Permissions, SSO, SCIM | ✅ v2.2.0 |
| Sessions gap-fill | v2.2.1 | Sessions, trusted devices, Security Center APIs | ✅ |
| Data Layer & Notifications | B011–B015 | Postgres/repos, domain APIs, storage, BullMQ, notifications | ✅ v2.3.0 |
| Platform Deepening | B016–B020 | Email, immutable audit, org structure, workflows, tenancy | ⏳ next |
| Backend Beta | B021–B025 | Hardening → v2.5.0 | ⏳ |
