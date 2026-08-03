import { BarChart3, BookOpen, Briefcase, Home, Plug, Settings, Sparkles, type LucideIcon } from 'lucide-react'

export type NavGroupId = 'workspace' | 'insights' | 'general'

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
  { id: 'insights', label: 'Insights' },
  { id: 'general', label: 'General' },
]

export const NAV_ITEMS: NavItemConfig[] = [
  {
    id: 'home',
    label: 'Home',
    path: '/',
    icon: Home,
    group: 'workspace',
    description: 'Your RegIntel Professional overview.',
  },
  {
    id: 'ai',
    label: 'AI Workspace',
    path: '/ai',
    icon: Sparkles,
    group: 'workspace',
    description: 'A dedicated space for AI-assisted analysis and drafting.',
  },
  {
    id: 'knowledge',
    label: 'Knowledge',
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
    description: 'Track and manage your active work items.',
  },
  {
    id: 'reports',
    label: 'Reports',
    path: '/reports',
    icon: BarChart3,
    group: 'insights',
    description: 'Generate and review reports.',
  },
  {
    id: 'integrations',
    label: 'Integrations',
    path: '/integrations',
    icon: Plug,
    group: 'insights',
    description: 'Connect RegIntel to the tools your team already uses.',
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

export function findNavItemByPath(pathname: string): NavItemConfig | undefined {
  if (pathname === '/') return NAV_ITEMS[0]
  return NAV_ITEMS.find((item) => item.path !== '/' && pathname.startsWith(item.path))
}
