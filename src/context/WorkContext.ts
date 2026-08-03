import { createContext } from 'react'
import type {
  ActivityItem,
  AiWorkSuggestion,
  AppNotification,
  DecisionRecord,
  EvidenceItem,
  TimelineEvent,
  WorkCase,
  WorkComment,
  WorkTask,
  WorkUser,
  CaseStatus,
  Priority,
  RiskLevel,
  TaskStatus,
} from '../types/work'

export interface WorkContextValue {
  users: WorkUser[]
  getUser: (id: string) => WorkUser | undefined

  cases: WorkCase[]
  getCase: (id: string) => WorkCase | undefined
  updateCaseStatus: (id: string, status: CaseStatus) => void

  tasks: WorkTask[]
  getTasksForCase: (caseId: string) => WorkTask[]
  createTask: (input: Omit<WorkTask, 'id' | 'createdAt' | 'updatedAt' | 'checklist'> & { checklist?: WorkTask['checklist'] }) => WorkTask
  updateTask: (id: string, patch: Partial<Pick<WorkTask, 'title' | 'description' | 'status' | 'priority' | 'ownerId' | 'dueDate' | 'checklist'>>) => void
  deleteTask: (id: string) => void
  duplicateTask: (id: string) => WorkTask | undefined
  completeTask: (id: string) => void
  toggleChecklistItem: (taskId: string, itemId: string) => void

  evidence: EvidenceItem[]
  getEvidenceForCase: (caseId: string) => EvidenceItem[]

  decisions: DecisionRecord[]
  getDecisionsForCase: (caseId: string) => DecisionRecord[]
  recordDecision: (input: Omit<DecisionRecord, 'id' | 'version' | 'createdAt'>) => DecisionRecord

  timeline: TimelineEvent[]
  getTimelineForCase: (caseId: string) => TimelineEvent[]

  comments: WorkComment[]
  getCommentsForCase: (caseId: string) => WorkComment[]
  addComment: (caseId: string, body: string, authorId?: string, taskId?: string) => void

  activity: ActivityItem[]
  notifications: AppNotification[]
  unreadNotificationCount: number
  markNotificationRead: (id: string) => void
  markAllNotificationsRead: () => void
  dismissNotification: (id: string) => void
  clearAllNotifications: () => void

  suggestions: AiWorkSuggestion[]
  getSuggestionsForCase: (caseId: string) => AiWorkSuggestion[]

  /** Current user for local demo actions. */
  currentUserId: string
}

export const WorkContext = createContext<WorkContextValue | null>(null)

export type { CaseStatus, Priority, RiskLevel, TaskStatus }
