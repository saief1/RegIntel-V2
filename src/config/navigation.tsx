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
    path: '/ai/agents',
    description: 'Continuous regulatory monitoring agents and health dashboard.',
  },
]

export function findNavItemByPath(pathname: string): NavItemConfig | undefined {
  if (pathname === '/') return NAV_ITEMS[0]
  return NAV_ITEMS.find((item) => item.path !== '/' && pathname.startsWith(item.path))
}
