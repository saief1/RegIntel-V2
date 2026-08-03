/**
 * Domain types for the Compliance Workspace (Sprint 4).
 * All backing data is local/static — there is no backend.
 */

export type CaseStatus = 'open' | 'in_review' | 'escalated' | 'completed' | 'closed'
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical'
export type Priority = 'low' | 'medium' | 'high' | 'urgent'
export type TaskStatus = 'todo' | 'in_progress' | 'blocked' | 'done'
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
export type DecisionOutcome = 'approve' | 'reject' | 'escalate' | 'defer' | 'remediate'
export type NotificationKind = 'assignment' | 'due' | 'mention' | 'decision' | 'system'

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

export interface WorkTask {
  id: string
  caseId: string
  title: string
  description: string
  status: TaskStatus
  priority: Priority
  ownerId: string
  dueDate: string
  checklist: { id: string; label: string; done: boolean }[]
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
}

export interface ActivityItem {
  id: string
  title: string
  description: string
  actorId: string
  caseId?: string
  createdAt: string
}

export interface AppNotification {
  id: string
  kind: NotificationKind
  title: string
  body: string
  caseId?: string
  read: boolean
  createdAt: string
  group: string
}

export interface AiWorkSuggestion {
  id: string
  caseId: string
  kind: 'action' | 'regulation' | 'missing_evidence' | 'risk' | 'next_step'
  title: string
  detail: string
  documentId?: string
}
