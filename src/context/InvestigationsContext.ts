import { createContext } from 'react'
import type {
  Investigation,
  InvestigationActivity,
  InvestigationAiSuggestion,
  InvestigationAttachment,
  InvestigationDecision,
  InvestigationEvidence,
  InvestigationNote,
  InvestigationNotification,
  InvestigationTask,
  InvestigationTimelineEvent,
  RegulatoryChange,
} from '../types/investigations'
import type { WorkUser } from '../types/work'

export interface InvestigationsContextValue {
  currentUserId: string
  users: WorkUser[]
  getUser: (id: string) => WorkUser | undefined

  investigations: Investigation[]
  getInvestigation: (id: string) => Investigation | undefined
  notes: InvestigationNote[]
  evidence: InvestigationEvidence[]
  tasks: InvestigationTask[]
  decisions: InvestigationDecision[]
  timeline: InvestigationTimelineEvent[]
  attachments: InvestigationAttachment[]
  activity: InvestigationActivity[]
  getNotes: (investigationId: string) => InvestigationNote[]
  getEvidence: (investigationId: string) => InvestigationEvidence[]
  getTasks: (investigationId: string) => InvestigationTask[]
  getDecisions: (investigationId: string) => InvestigationDecision[]
  getTimeline: (investigationId: string) => InvestigationTimelineEvent[]
  getAttachments: (investigationId: string) => InvestigationAttachment[]
  getSuggestions: (investigationId: string) => InvestigationAiSuggestion[]
  pinNote: (id: string) => void
  deleteNote: (id: string) => void

  changes: RegulatoryChange[]
  getChange: (id: string) => RegulatoryChange | undefined

  notifications: InvestigationNotification[]
  unreadNotificationCount: number
  markNotificationRead: (id: string) => void
  markAllNotificationsRead: () => void
  dismissNotification: (id: string) => void
  clearAllNotifications: () => void
}

export const InvestigationsContext = createContext<InvestigationsContextValue | null>(null)
