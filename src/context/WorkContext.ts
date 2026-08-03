import { createContext } from 'react'
import type {
  ActivityItem,
  AiActionType,
  AiWorkSuggestion,
  AppNotification,
  DecisionRecord,
  EvidenceItem,
  Priority,
  TimelineEvent,
  WorkCase,
  WorkComment,
  WorkItemKind,
  WorkTask,
  WorkUser,
  CaseStatus,
  RiskLevel,
  TaskStatus,
  ChecklistItem,
  SmartEstimate,
} from '../types/work'

export interface CreateWorkTaskInput {
  caseId?: string
  title: string
  description?: string
  status?: TaskStatus
  priority?: Priority
  ownerId?: string
  dueDate?: string
  checklist?: ChecklistItem[]
  kind?: WorkItemKind
  aiGenerated?: boolean
  linkedRegulation?: string
  linkedPolicyIds?: string[]
  parentId?: string
  awaitingApproval?: boolean
  estimate?: SmartEstimate
}

export interface WorkContextValue {
  users: WorkUser[]
  getUser: (id: string) => WorkUser | undefined

  cases: WorkCase[]
  getCase: (id: string) => WorkCase | undefined
  updateCaseStatus: (id: string, status: CaseStatus) => void

  tasks: WorkTask[]
  getTask: (id: string) => WorkTask | undefined
  getTasksForCase: (caseId: string) => WorkTask[]
  getSubtasks: (parentId: string) => WorkTask[]
  createTask: (input: CreateWorkTaskInput) => WorkTask
  createTasksFromLabels: (labels: string[], defaults?: Partial<CreateWorkTaskInput>) => WorkTask[]
  updateTask: (
    id: string,
    patch: Partial<
      Pick<
        WorkTask,
        | 'title'
        | 'description'
        | 'status'
        | 'priority'
        | 'ownerId'
        | 'dueDate'
        | 'checklist'
        | 'kind'
        | 'linkedRegulation'
        | 'linkedPolicyIds'
        | 'awaitingApproval'
        | 'estimate'
      >
    >,
  ) => void
  deleteTask: (id: string) => void
  deleteTasks: (ids: string[]) => void
  duplicateTask: (id: string) => WorkTask | undefined
  completeTask: (id: string) => void
  toggleChecklistItem: (taskId: string, itemId: string) => void
  setChecklist: (taskId: string, checklist: ChecklistItem[]) => void
  bulkUpdateTasks: (
    ids: string[],
    patch: Partial<Pick<WorkTask, 'status' | 'priority' | 'ownerId' | 'dueDate'>>,
  ) => void
  createFromAiAction: (input: {
    action: AiActionType
    title: string
    description?: string
    ownerId?: string
    priority?: Priority
    linkedRegulation?: string
    checklistLabels?: string[]
  }) => WorkTask

  evidence: EvidenceItem[]
  getEvidenceForCase: (caseId: string) => EvidenceItem[]
  getEvidenceForTask: (taskId: string) => EvidenceItem[]

  decisions: DecisionRecord[]
  getDecisionsForCase: (caseId: string) => DecisionRecord[]
  recordDecision: (input: Omit<DecisionRecord, 'id' | 'version' | 'createdAt'>) => DecisionRecord

  timeline: TimelineEvent[]
  getTimelineForCase: (caseId: string) => TimelineEvent[]
  getTimelineForTask: (taskId: string) => TimelineEvent[]

  comments: WorkComment[]
  getCommentsForCase: (caseId: string) => WorkComment[]
  getCommentsForTask: (taskId: string) => WorkComment[]
  addComment: (caseId: string, body: string, authorId?: string, taskId?: string) => void

  activity: ActivityItem[]
  notifications: AppNotification[]
  unreadNotificationCount: number
  markNotificationRead: (id: string) => void
  markAllNotificationsRead: () => void
  dismissNotification: (id: string) => void
  clearAllNotifications: () => void
  pushNotification: (input: Omit<AppNotification, 'id' | 'createdAt' | 'read'> & { read?: boolean }) => void

  suggestions: AiWorkSuggestion[]
  getSuggestionsForCase: (caseId: string) => AiWorkSuggestion[]

  /** Current user for local demo actions. */
  currentUserId: string
  defaultCaseId: string
}

export const WorkContext = createContext<WorkContextValue | null>(null)

export type { CaseStatus, Priority, RiskLevel, TaskStatus }
