import { BarChart3, BookOpen, Briefcase, Home, Settings, Sparkles, type LucideIcon } from 'lucide-react'

export type NavGroupId = 'workspace' | 'general'

export interface NavGroup {
  id: NavGroupId
  label: string
}

export interface NavItemConfig {
  id: string
  label: string
  path: string
  icon: LucideIcon
  group: NavGroupId
  /** Shown on the section's ComingSoon page; describes what the section is for, not fabricated content. */
  description: string
}

export const NAV_GROUPS: NavGroup[] = [
  { id: 'workspace', label: 'Workspace' },
  { id: 'general', label: 'General' },
]

/** Primary navigation — max 6 items per V2 design system. */
export const NAV_ITEMS: NavItemConfig[] = [
  {
    id: 'home',
    label: 'Home',
    path: '/',
    icon: Home,
    group: 'workspace',
    description: 'Your RegIntel overview and daily brief.',
  },
  {
    id: 'ai',
    label: 'AI Workspace',
    path: '/ai',
    icon: Sparkles,
    group: 'workspace',
    description: 'AI-powered compliance assistant for chat, research, analysis, and drafting.',
  },
  {
    id: 'knowledge',
    label: 'Library',
    path: '/knowledge',
    icon: BookOpen,
    group: 'workspace',
    description: 'Your regulatory knowledge base and reference library.',
  },
  {
    id: 'work',
    label: 'Work',
    path: '/work',
    icon: Briefcase,
    group: 'workspace',
    description: 'Cases, investigations, and active work items.',
  },
  {
    id: 'reports',
    label: 'Reports',
    path: '/reports',
    icon: BarChart3,
    group: 'workspace',
    description: 'Generate and review reports.',
  },
  {
    id: 'settings',
    label: 'Settings',
    path: '/settings',
    icon: Settings,
    group: 'general',
    description: 'Manage workspace and account preferences.',
  },
]

/** Secondary destinations kept out of primary nav but fully routed. */
export const SECONDARY_DESTINATIONS: Array<{ id: string; label: string; path: string; description: string }> = [
  {
    id: 'investigations',
    label: 'Investigations',
    path: '/investigations',
    description: 'Investigate compliance issues and evidence gaps.',
  },
  {
    id: 'regulatory-changes',
    label: 'Regulatory Changes',
    path: '/regulatory-changes',
    description: 'Track regulatory updates and impact assessments.',
  },
  {
    id: 'policies',
    label: 'Policy Workspace',
    path: '/knowledge/policies',
    description: 'Manage policy lifecycle, versions, and approvals.',
  },
  {
    id: 'workflows',
    label: 'Workflow Builder',
    path: '/work/workflows',
    description: 'Design and reuse compliance workflow templates.',
  },
  {
    id: 'calendar',
    label: 'Compliance Calendar',
    path: '/work/calendar',
    description: 'Unified calendar for reviews, approvals, and deadlines.',
  },
  {
    id: 'integrations',
    label: 'Integrations',
    path: '/integrations',
    description: 'Connect RegIntel to tools your team already uses.',
  },
  {
    id: 'api-platform',
    label: 'API Platform',
    path: '/settings/api',
    description: 'Developer portal for keys, OAuth, webhooks, and API usage.',
  },
  {
    id: 'admin-console',
    label: 'Admin Console',
    path: '/settings/admin',
    description: 'Tenant, identity, session, and security administration.',
  },
  {
    id: 'collaboration',
    label: 'Collaboration',
    path: '/settings/collaboration',
    description: 'Channels, mentions, digests, and watchlists.',
  },
  {
    id: 'ai-agents',
    label: 'AI Agents',
    path: '/agents',
    description: 'Autonomous compliance workforce with pause, resume, run now, and history.',
  },
  {
    id: 'agent-builder',
    label: 'Agent Builder',
    path: '/agents/builder',
    description: 'Configure custom AI agents with triggers, sources, and approval gates.',
  },
  {
    id: 'autonomous-queue',
    label: 'Autonomous Work Queue',
    path: '/agents/queue',
    description: 'Central queue for AI recommendations awaiting human supervision.',
  },
  {
    id: 'knowledge-graph',
    label: 'Knowledge Graph',
    path: '/knowledge/graph',
    description: 'Interactive relationship explorer across the compliance graph.',
  },
  {
    id: 'command-center',
    label: 'AI Command Center',
    path: '/reports/command',
    description: 'Executive AI workspace with risk, health, and generated briefs.',
  },
  {
    id: 'continuous-monitoring',
    label: 'Continuous Monitoring',
    path: '/ai/agents',
    description: 'Regulator-specific monitoring agents and health dashboard.',
  },
  {
    id: 'analytics-center',
    label: 'Analytics Center',
    path: '/reports/analytics',
    description: 'Executive analytics with heatmaps, trends, and saved views.',
  },
  {
    id: 'kpi-builder',
    label: 'KPI Builder',
    path: '/reports/kpis',
    description: 'Compose custom compliance KPIs with thresholds and alerts.',
  },
  {
    id: 'predictive',
    label: 'Predictive Compliance',
    path: '/reports/predictive',
    description: 'AI forecasts for workload, audit findings, and resources.',
  },
  {
    id: 'board-studio',
    label: 'Board Reporting Studio',
    path: '/reports/board',
    description: 'Assemble and schedule board packages for leadership.',
  },
  {
    id: 'benchmarking',
    label: 'Enterprise Benchmarking',
    path: '/reports/benchmark',
    description: 'Compare departments, regions, and business units.',
  },
  {
    id: 'data-management',
    label: 'Data Management',
    path: '/settings/data',
    description: 'Imports, exports, quality, retention, and restore jobs.',
  },
  {
    id: 'security-center',
    label: 'Security Center',
    path: '/settings/security',
    description: 'Sessions, devices, alerts, IP restrictions, and secrets.',
  },
  {
    id: 'audit-center',
    label: 'Audit Center',
    path: '/audit',
    description: 'Audit planning, findings, evidence requests, and lifecycle.',
  },
  {
    id: 'automation-studio',
    label: 'Automation Studio',
    path: '/automation',
    description: 'No-code enterprise automations with run history.',
  },
  {
    id: 'system-health',
    label: 'System Health',
    path: '/system',
    description: 'Platform status, queues, feature flags, and release notes.',
  },
  {
    id: 'integration-marketplace',
    label: 'Integration Marketplace',
    path: '/integrations/marketplace',
    description: 'Browse and manage enterprise connectors by category.',
  },
  {
    id: 'integration-builder',
    label: 'Integration Builder',
    path: '/integrations/builder',
    description: 'Build custom REST, GraphQL, webhook, and sync integrations.',
  },
  {
    id: 'workflow-canvas',
    label: 'Workflow Studio 2.0',
    path: '/automation/canvas',
    description: 'Visual workflow canvas with versioning and rollback.',
  },
  {
    id: 'data-lineage',
    label: 'Data Lineage',
    path: '/data/lineage',
    description: 'Dependency graph from regulation to report.',
  },
  {
    id: 'digital-twin',
    label: 'Executive Digital Twin',
    path: '/reports/digital-twin',
    description: 'Simulate organizational capacity and compliance impact.',
  },
  {
    id: 'developer-portal',
    label: 'Developer Portal',
    path: '/developer',
    description: 'API health, usage, keys, webhooks, and SDK downloads.',
  },
  {
    id: 'developer-api',
    label: 'API Explorer',
    path: '/developer/api',
    description: 'Interactive public API documentation and playground.',
  },
  {
    id: 'developer-apps',
    label: 'API Keys & Apps',
    path: '/developer/apps',
    description: 'Live and sandbox keys plus OAuth applications.',
  },
  {
    id: 'developer-webhooks',
    label: 'Webhooks Center',
    path: '/developer/webhooks',
    description: 'Event subscriptions, delivery logs, and replay.',
  },
  {
    id: 'developer-sdk',
    label: 'SDKs & Resources',
    path: '/developer/sdk',
    description: 'SDKs, CLI, sample projects, and Postman assets.',
  },
  {
    id: 'operations-center',
    label: 'Operations Center',
    path: '/operations',
    description: 'Platform health, jobs, infrastructure, and maintenance.',
  },
  {
    id: 'operations-incidents',
    label: 'Incident Management',
    path: '/operations/incidents',
    description: 'Incident lifecycle, impact, and status page preview.',
  },
  {
    id: 'operations-backups',
    label: 'Backup & DR',
    path: '/operations/backups',
    description: 'Backups, restore, RPO/RTO, and DR simulation.',
  },
  {
    id: 'operations-deployments',
    label: 'Deployment Center',
    path: '/operations/deployments',
    description: 'Environments, rollbacks, flags, and release notes.',
  },
  {
    id: 'operations-observability',
    label: 'Observability',
    path: '/operations/observability',
    description: 'Metrics, logs, tracing, and alert policies.',
  },
  {
    id: 'solutions-marketplace',
    label: 'Solution Marketplace',
    path: '/solutions',
    description: 'Browse and install industry solution packs.',
  },
  {
    id: 'solutions-wealth',
    label: 'Wealth Management Pack',
    path: '/solutions/wealth',
    description: 'CIRO/CSA/FINTRAC wealth compliance for Canadian dealers.',
  },
  {
    id: 'solutions-banking',
    label: 'Banking Pack',
    path: '/solutions/banking',
    description: 'AML, sanctions, privacy, and banking risk dashboards.',
  },
  {
    id: 'solutions-insurance',
    label: 'Insurance Pack',
    path: '/solutions/insurance',
    description: 'Market conduct, licensing, and agent supervision.',
  },
  {
    id: 'solutions-grc',
    label: 'Enterprise GRC Pack',
    path: '/solutions/grc',
    description: 'Risk matrix, controls, audit universe, and SOX.',
  },
  {
    id: 'onboarding',
    label: 'Guided Onboarding',
    path: '/onboarding',
    description: 'Workspace setup wizard with progress and checklist.',
  },
  {
    id: 'learning-center',
    label: 'Learning Center',
    path: '/help',
    description: 'Docs, tours, academies, API docs, and FAQ.',
  },
  {
    id: 'customer-success',
    label: 'Customer Success',
    path: '/customer-success',
    description: 'Adoption score, checklist, and recommendations.',
  },
  {
    id: 'product-tours',
    label: 'Product Tours',
    path: '/settings/tours',
    description: 'First-login and area tours with coach marks.',
  },
  {
    id: 'community',
    label: 'Community & Feedback',
    path: '/community',
    description: 'Feature requests, roadmap, and release highlights.',
  },
]

export function findNavItemByPath(pathname: string): NavItemConfig | undefined {
  if (pathname === '/') return NAV_ITEMS[0]
  return NAV_ITEMS.find((item) => item.path !== '/' && pathname.startsWith(item.path))
}
