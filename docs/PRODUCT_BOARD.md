# Product Board

Mirror of the Product Board in [`ROADMAP.md`](./ROADMAP.md). **ROADMAP.md is authoritative** — update both when phase status changes.

| Phase | Status | Progress |
|---|---|---|
| Frontend Platform GA (v2.0.0) | ✅ Complete | 100% |
| Phase A – Stabilization | ✅ Complete | 100% |
| Phase B – Backend Platform | ✅ Complete | 100% (B000–B025 ✅ + v2.2.1; Backend GA v2.5.0) |
| Phase C – AI Intelligence Layer | 🔄 In Progress | 25% (C001–C005 ✅ → v2.6.0) |
| Phase D – Wealth Management Production | ⏳ Planned | 0% |
| Phase E – Enterprise Integrations | ⏳ Planned | 0% |
| Phase F – Pilot Customers | ⏳ Planned | 0% |
| RegIntel v3.0 Commercial Launch | ⏳ Planned | 0% |

## Current step

**Phase C** — next **C006–C010** (Retrieval / RAG → v2.7.0). Do **not** start C006 in this release.

Milestone C1 complete: **v2.6.0** / `AI_FOUNDATION_COMPLETE` (C001–C005 AI Foundation).  
Milestone B5 complete: **v2.5.0** / `BACKEND_GA_COMPLETE` (B021–B025 Backend GA).  
Milestone B4 complete: **v2.4.0** / `MILESTONE_B4_COMPLETE` (B016–B020 Infrastructure & Production Readiness).  
Milestone B3 complete: **v2.3.0** / `MILESTONE_B3_COMPLETE` (B011–B015 Data Layer & Notifications).  
Milestone B2 complete: **v2.2.0** / `B2_COMPLETE` (B006–B010).  
Sessions gap-fill: **v2.2.1** / `B2_SESSIONS_COMPLETE`.  
Milestone B1: **v2.1.0** / `MILESTONE_B1_COMPLETE`.  
Architecture Contract: [`BACKEND_ARCHITECTURE.md`](./BACKEND_ARCHITECTURE.md) ✅.  
AI Architecture: [`AI_ARCHITECTURE.md`](./AI_ARCHITECTURE.md).

UI frozen except integration wiring. Domain FE providers remain mock-default (`VITE_USE_REAL_*` false), including `VITE_USE_REAL_AI`.

## Version targets

| Version | Milestone |
|---|---|
| v2.0.x | Frontend Platform + Stabilization ✅ |
| v2.1.0 | Backend Foundation (B001–B005) ✅ |
| v2.2.0 | Identity & Access (B006–B010) ✅ |
| v2.2.1 | Identity & Sessions Completeness ✅ |
| v2.3.0 | Data Layer & Notifications (B011–B015) ✅ |
| v2.4.0 | Infrastructure & Production Readiness (B016–B020) ✅ |
| v2.5.0 | Backend GA (B021–B025) ✅ |
| v2.6.0 | AI Foundation (C001–C005) ✅ |
| v2.7.0 | AI Retrieval / RAG (C006–C010) |
| v2.8.0 | AI Memory / agents track (C011–C015) |
| v2.9.0 | AI Autonomous / safety (C016–C020) |
| v3.0.0 | Commercial GA + Phase D band |

## Tree

```
RegIntel v2.x Frontend Platform GA (v2.0.0)
→ Phase A Platform Stabilization (A001–A010) ✅ v2.0.1
→ Phase B Backend Platform (B000–B025) ✅
    → B000 Architecture Contract ✅
    → B001–B005 Foundation → v2.1.0 ✅
    → B006–B010 Identity & access → v2.2.0 ✅
    → v2.2.1 Sessions / Security Center gap-fill ✅
    → B011–B015 Data Layer & Notifications → v2.3.0 ✅
    → B016–B020 Infrastructure & Production Readiness → v2.4.0 ✅
    → B021–B025 Backend GA → v2.5.0 ✅
→ Phase C AI Intelligence Layer (C001–C020)
    → C001–C005 AI Foundation → v2.6.0 ✅
    → C006–C010 Retrieval / RAG → v2.7.0
    → C011–C015 Agents / memory → v2.8.0
    → C016–C020 Audit & safety → v2.9.0
→ Phase D Wealth Management Production (D001–D020) → v3.0 band
→ Phase E Enterprise Integrations (E001–E015)
→ Phase F Pilot Customers (F001–F015)
→ RegIntel v3.0 Commercial Launch
```

## Phase C ticket bands

| Band | IDs | Theme | Status |
|---|---|---|---|
| C1 Foundation | C001–C005 | Providers, embeddings, vectors, prompts, gateway | ✅ v2.6.0 |
| C2 Retrieval | C006–C010 | RAG, indexing, citations | ⏳ v2.7.0 |
| C3 Agents/Memory | C011–C015 | Agent runtime, tools, HITL, memory | ⏳ v2.8.0 |
| C4 Safety | C016–C020 | Audit, redaction, guardrails | ⏳ v2.9.0 |
