# Product Board

Mirror of the Product Board in [`ROADMAP.md`](./ROADMAP.md). **ROADMAP.md is authoritative** — update both when phase status changes.

| Phase | Status | Progress |
|---|---|---|
| Frontend Platform GA (v2.0.0) | ✅ Complete | 100% |
| Phase A – Stabilization | ✅ Complete | 100% |
| Phase B – Backend Platform | 🔄 In Progress | ~20% (B000–B005 ✅; next B006+) |
| Phase C – AI Intelligence Layer | ⏳ Planned | 0% |
| Phase D – Wealth Management Production | ⏳ Planned | 0% |
| Phase E – Enterprise Integrations | ⏳ Planned | 0% |
| Phase F – Pilot Customers | ⏳ Planned | 0% |
| RegIntel v3.0 Commercial Launch | ⏳ Planned | 0% |

## Current step

**B006+** (Identity & access) → target **v2.2.0**.

Milestone B1 complete: **v2.1.0** / `MILESTONE_B1_COMPLETE`.  
Architecture Contract: [`BACKEND_ARCHITECTURE.md`](./BACKEND_ARCHITECTURE.md) ✅.

UI frozen except integration wiring.

## Version targets

| Version | Milestone |
|---|---|
| v2.0.x | Frontend Platform + Stabilization ✅ |
| v2.1.0 | Backend Foundation (B001–B005) ✅ |
| v2.2.0 | Identity & Organizations (B006–B015) |
| v2.3.0 | Core Data Platform (B016–B020) |
| v2.4.0 | API & Platform Services (B021–B025) |
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
    → B006–B015 Identity & Organizations → v2.2.0 (next)
    → B016–B020 Core Data Platform → v2.3.0
    → B021–B025 Platform Services → v2.4.0 / v2.5.0
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
| Identity & access | B006–B010 | MFA, RBAC, Permissions, SSO, SCIM | ⏳ next |
| Org structure | B011–B015 | Workspaces, Teams, Departments, Invitations, Tenant isolation | ⏳ |
| First live domains | B016–B020 | Knowledge, Policies, Tasks, Notifications, Cases (mock → API) | ⏳ |
| Platform services | B021–B025 | Storage, Jobs, Notification delivery, Audit, Multi-tenancy guarantees | ⏳ |
