/**
 * Domain types for the Compliance Workspace / Action Center (Sprint 4 + 7).
 * All backing data is local/static — there is no backend.
 */

export type CaseStatus = 'open' | 'in_review' | 'escalated' | 'completed' | 'closed'
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical'
export type Priority = 'low' | 'medium' | 'high' | 'urgent'
/** Board / execution statuses for Action Center tasks. */
export type TaskStatus = 'backlog' | 'todo' | 'in_progress' | 'review' | 'blocked' | 'completed'
export type WorkItemKind =
  | 'task'
  | 'project'
  | 'policy_update'
  | 'risk_review'
  | 'evidence_request'
  | 'board_item'
export type EvidenceStatus = 'pending' | 'verified' | 'rejected'
export type EvidenceKind = 'attachment' | 'note' | 'link' | 'regulation'
export type TimelineEventType =
  | 'assigned'
  | 'opened'
  | 'reviewed'
  | 'escalated'
  | 'closed'
  | 'comment'
  | 'evidence_added'
  | 'decision_recorded'
  | 'task_updated'
  | 'checklist_generated'
  | 'ai_action'
export type DecisionOutcome = 'approve' | 'reject' | 'escalate' | 'defer' | 'remediate'
export type NotificationKind = 'assignment' | 'due' | 'mention' | 'decision' | 'system' | 'approval' | 'ai' | 'regulation'
export type NotificationGroup = 'Tasks' | 'Approvals' | 'AI' | 'Deadlines' | 'Regulations' | 'Mentions' | 'System'

export interface WorkUser {
  id: string
  name: string
  initials: string
  role: string
}

export interface WorkCase {
  id: string
  caseNumber: string
  title: string
  summary: string
  status: CaseStatus
  risk: RiskLevel
  priority: Priority
  ownerId: string
  assigneeIds: string[]
  dueDate: string
  createdAt: string
  updatedAt: string
  relatedDocumentIds: string[]
  relatedCaseIds: string[]
  tags: string[]
}

export interface ChecklistItem {
  id: string
  label: string
  done: boolean
}

export interface SmartEstimate {
  /** Recommended calendar days to complete. */
  recommendedDays: number
  /** Estimated effort in hours. */
  estimatedHours: number
  businessImpact: 'Low' | 'Medium' | 'High' | 'Critical'
  summary: string
}

export interface WorkTask {
  id: string
  caseId: string
  title: string
  description: string
  status: TaskStatus
  priority: Priority
  ownerId: string
  dueDate: string
  checklist: ChecklistItem[]
  kind: WorkItemKind
  aiGenerated: boolean
  linkedRegulation?: string
  linkedPolicyIds: string[]
  parentId?: string
  awaitingApproval: boolean
  estimate?: SmartEstimate
  createdAt: string
  updatedAt: string
}

export interface WorkComment {
  id: string
  caseId: string
  authorId: string
  body: string
  createdAt: string
  taskId?: string
}

export interface EvidenceItem {
  id: string
  caseId: string
  kind: EvidenceKind
  title: string
  note?: string
  url?: string
  documentId?: string
  status: EvidenceStatus
  source: string
  confidence: number
  addedById: string
  createdAt: string
  taskId?: string
}

export interface DecisionRecord {
  id: string
  caseId: string
  outcome: DecisionOutcome
  reason: string
  supportingDocumentIds: string[]
  evidenceIds: string[]
  reviewerId: string
  version: number
  createdAt: string
}

export interface TimelineEvent {
  id: string
  caseId: string
  type: TimelineEventType
  title: string
  description?: string
  actorId: string
  createdAt: string
  taskId?: string
}

export interface ActivityItem {
  id: string
  title: string
  description: string
  actorId: string
  caseId?: string
  taskId?: string
  createdAt: string
}

export interface AppNotification {
  id: string
  kind: NotificationKind
  title: string
  body: string
  caseId?: string
  taskId?: string
  href?: string
  read: boolean
  createdAt: string
  group: NotificationGroup | string
}

export interface AiWorkSuggestion {
  id: string
  caseId: string
  kind: 'action' | 'regulation' | 'missing_evidence' | 'risk' | 'next_step'
  title: string
  detail: string
  documentId?: string
}

export type AiActionType =
  | 'create_task'
  | 'create_project'
  | 'update_policy'
  | 'generate_checklist'
  | 'create_control'
  | 'assign_owner'
  | 'schedule_review'
  | 'add_to_board'

export interface GeneratedChecklistSeed {
  title: string
  items: string[]
  linkedRegulation?: string
  estimate?: SmartEstimate
}
