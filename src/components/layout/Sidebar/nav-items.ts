import type { ComponentType } from 'react'
import {
  AIWorkspaceIcon,
  HomeIcon,
  KnowledgeIcon,
  ReportsIcon,
  SettingsIcon,
  WorkIcon,
  type IconProps,
} from '../../icons'

export interface NavItemConfig {
  id: string
  label: string
  icon: ComponentType<IconProps>
}

export const NAV_ITEMS: NavItemConfig[] = [
  { id: 'home', label: 'Home', icon: HomeIcon },
  { id: 'ai-workspace', label: 'AI Workspace', icon: AIWorkspaceIcon },
  { id: 'knowledge', label: 'Knowledge', icon: KnowledgeIcon },
  { id: 'work', label: 'Work', icon: WorkIcon },
  { id: 'reports', label: 'Reports', icon: ReportsIcon },
  { id: 'settings', label: 'Settings', icon: SettingsIcon },
]
