# Changelog

## Purpose

This document tracks notable changes to RegIntel over time, following a format inspired by [Keep a Changelog](https://keepachangelog.com/). It should be updated alongside meaningful merges/releases.

## Table of Contents

- [1. Format](#1-format)
- [2. Unreleased](#2-unreleased)
- [3. Released Versions](#3-released-versions)

## 1. Format

Each entry should be categorized under one of: `Added`, `Changed`, `Deprecated`, `Removed`, `Fixed`, `Security`.

## 2. Unreleased

### Added

- None yet.

### Changed

- None yet.

### Fixed

- None yet.

## 3. Released Versions

| Version | Date | Summary |
|---|---|---|
| 1.0.0-beta | 2026-08-03 | Autonomous Compliance — AI workforce, queue, knowledge graph |
| 0.9.0 | 2026-08-02 | Connected Enterprise — integrations, API platform, AI agents |
| 0.8.0 | 2026-08-02 | Enterprise Governance — policy lifecycle, workflows, RBAC |
| 0.7.0 | 2026-08-02 | Execution Platform — AI → Work Action Center |

### v1.0.0-beta — Autonomous AI Compliance Platform

**Status:** Beta  
**Sprint:** 10 (`SPRINT10_COMPLETE`)  
**Date:** 2026-08-03

RegIntel moves from AI assistant to AI workforce — autonomous agents that monitor, analyze, recommend, assign, and track compliance work under human supervision.

#### Highlights

##### AI Agent Workspace (P046)

- Top-level `/agents` workforce with 10 autonomous specialists
- Status, health, confidence, queue, current job, schedule
- Pause / Resume / Run Now / View History
- Explainability, logs, retries, activity timeline

##### Agent Builder (P047)

- Custom agent configuration (trigger, sources, systems, output, approvals, schedule)
- Visual workflow: Trigger → Collect → Analyze → Decision → Create Tasks → Notify → Complete

##### Autonomous Work Queue (P048)

- Central queue with New → Completed/Failed states
- Priority, confidence, estimates, linked regulation/policy, bulk approve/reject

##### Knowledge Graph (P049)

- Interactive SVG graph with zoom, filter, search, detail panel
- Accessible list fallback

##### Executive AI Command Center (P050)

- Risk, health, critical issues, agent activity, forecasts, bottlenecks
- Daily / weekly / monthly AI briefs with regenerate

### v0.9.0 — Connected Enterprise Platform

**Status:** Stable  
**Sprint:** 9 (`SPRINT9_COMPLETE`)  
**Date:** 2026-08-02

RegIntel becomes the compliance command center for the enterprise stack — integrations, developer APIs, continuous AI monitoring, collaboration, and admin controls.

#### Highlights

##### Integration Hub (P041)

- Settings Integrations area plus `/integrations`
- Sixteen mock connectors (M365, Outlook, SharePoint, Teams, Jira, ServiceNow, Slack, Confluence, OneDrive, Google Workspace, GitHub, Box, AWS S3, Azure Blob, Generic REST, Webhooks)
- Status, health, owner, permissions, sync frequency, activity log, disconnect/reconnect
- Background sync queue with retry UI, error history, global activity stream

##### API Platform (P042)

- API keys, OAuth clients, webhooks, event logs
- Usage & rate limits, documentation viewer, test console

##### Continuous AI Monitoring (P043)

- Agents for FINTRAC, CIRO, CSA, OSFI, SEC, FINRA, FCA, ESMA
- Last scan, publications, impact, confidence, actions, generated tasks
- Agent health dashboard

##### Notifications & Collaboration (P044)

- Mentions, channels, announcement banners, digests, watchlists
- Expanded notification feed with approval reminders

##### Enterprise Administration (P045)

- Admin Console: tenant, users, teams/departments, SSO/SAML/SCIM (mock)
- Sessions, MFA, password/security policies, login history

### v0.8.0 — Enterprise Governance

**Status:** Stable  
**Sprint:** 8 (`SPRINT8_COMPLETE`)  
**Date:** 2026-08-02

RegIntel evolves from an AI-powered compliance execution platform into a full enterprise GRC operating system.

#### Highlights

##### Enterprise Governance

- Policy Workspace
- Policy lifecycle
- Version history
- Side-by-side policy comparison
- Digital sign-off
- AI Policy Assistant

##### Workflow Automation

- Visual workflow builder
- Eight built-in workflow templates
- Automation rules
- Run-now automation

##### Governance

- Multi-stage approval workflows
- Immutable audit trail
- Organization management
- RBAC
- Enterprise search

##### Compliance Intelligence

- AI impact analysis
- Regulation ↔ Policy ↔ Control mapping
- Coverage scoring
- Relationship graph

##### Collaboration

- Comments
- Evidence
- Review cycles
- Compliance calendar

##### Executive

- Executive Dashboard
- Reporting Engine
- Export packages

#### Added

- Policy Workspace under Library with grid, list, and timeline views
- Policy version control with restore, AI change summary, and side-by-side diff
- Multi-step approval workflows with electronic sign-off comments and timestamps
- Visual workflow builder with reusable templates
- Immutable audit trail with user/action filters and export
- Organization structure (departments, business units, locations, teams)
- Role-based access control across view/edit/delete/approve/export/manage
- Enterprise search across policies, regulations, tasks, evidence, reports, comments, and people
- Executive Dashboard and Reporting Engine (PDF / Word / PowerPoint text packages)
- Compliance Calendar and automation rules engine

### v0.7.0 — Execution Platform

**Status:** Stable  
**Sprint:** 7 (`SPRINT7_COMPLETE`)  
**Date:** 2026-08-02

RegIntel moves from AI compliance assistant to AI-powered compliance execution platform.

#### Highlights

- Complete AI Workspace redesign
- Premium Apple / Harvey UI
- Action Center
- Kanban Work Management
- AI Task Generator
- AI Recommendation Cards
- Task Detail Pages
- Notifications
- Smart Due Dates
- Home Dashboard overhaul

#### Added

- Action Center with My Tasks, Assigned, Due Today, Overdue, Awaiting Approval, and Completed sections
- Work views: Board (drag-and-drop), List, Calendar, and Timeline
- Task detail pages with ownership, checklist progress, evidence, comments, subtasks, and activity
- One-click AI actions (task, project, policy update, checklist, control, owner, review, board item)
- AI implementation task generator with select/deselect and bulk create
- AI recommendation cards with impact, owner, priority, and estimated effort
- Smart due-date estimates (recommended days, effort hours, business impact)
- Global Work widget and grouped Notification Center (Tasks, Approvals, AI, Deadlines, Regulations)
- AI Workspace modes: Chat, Research, Document Analysis, Compare, Drafting

#### Changed

- Design system: purple accent (`#6D5EF6`), `#FAFAFA` background, Inter typography
- Primary navigation limited to Home, AI Workspace, Library, Work, Reports, Settings
- Home dashboard surfaces actionable compliance work instead of static metrics
- Work task statuses expanded for board workflow (Backlog → Completed)
