/**
 * Domain types for Investigations & Regulatory Change Management (Sprint 6).
 * Local/mock only — structured for future API adapters.
 */

export type InvestigationStatus = 'open' | 'in_progress' | 'pending_review' | 'escalated' | 'closed'
export type InvestigationPriority = 'low' | 'medium' | 'high' | 'urgent'
export type RiskScoreBand = 'low' | 'medium' | 'high' | 'critical'

export type InvestigationTimelineType =
  | 'status_change'
  | 'comment'
  | 'evidence_added'
  | 'ai_recommendation'
  | 'decision'
  | 'assignment'
  | 'note'
  | 'task'

export type NoteOrigin = 'manual' | 'ai'

export type InvestigationEvidenceType = 'document' | 'email' | 'screenshot' | 'interview' | 'system_log' | 'link'

export type RegulatoryChangeStatus = 'new' | 'pending_review' | 'assessing' | 'remediating' | 'completed' | 'deferred'

export type ImpactUrgency = 'low' | 'medium' | 'high' | 'immediate'

export interface Investigation {
  id: string
  caseId: string
  title: string
  summary: string
  status: InvestigationStatus
  priority: InvestigationPriority
  ownerId: string
  assigneeIds: string[]
  relatedRegulationId: string
  relatedRegulationTitle: string
  jurisdiction: string
  createdAt: string
  updatedAt: string
  dueDate: string
  riskScore: number
  riskBand: RiskScoreBand
  relatedCaseIds: string[]
  tags: string[]
}

export interface InvestigationNote {
  id: string
  investigationId: string
  authorId: string
  body: string
  createdAt: string
  updatedAt: string
  pinned: boolean
  origin: NoteOrigin
}

export interface InvestigationEvidence {
  id: string
  investigationId: string
  title: string
  source: string
  type: InvestigationEvidenceType
  createdAt: string
  confidence: number
  tags: string[]
  referenceUrl?: string
}

export interface InvestigationTask {
  id: string
  investigationId: string
  title: string
  status: 'todo' | 'in_progress' | 'done'
  ownerId: string
  dueDate: string
}

export interface InvestigationDecision {
  id: string
  investigationId: string
  outcome: string
  reason: string
  actorId: string
  createdAt: string
}

export interface InvestigationTimelineEvent {
  id: string
  investigationId: string
  type: InvestigationTimelineType
  title: string
  description?: string
  actorId: string
  createdAt: string
}

export interface InvestigationAttachment {
  id: string
  investigationId: string
  name: string
  sizeLabel: string
  uploadedAt: string
  uploadedById: string
}

export interface InvestigationActivity {
  id: string
  title: string
  description: string
  investigationId?: string
  changeId?: string
  actorId: string
  createdAt: string
}

export interface ImpactAssessment {
  risk: RiskScoreBand
  businessImpact: string
  complianceImpact: string
  operationalImpact: string
  urgency: ImpactUrgency
  confidence: number
  affectedDepartments: string[]
}

export interface RegulatoryChange {
  id: string
  title: string
  summary: string
  status: RegulatoryChangeStatus
  jurisdiction: string
  category: string
  effectiveDate: string
  publishedAt: string
  updatedAt: string
  reviewerId: string
  originalRegulationId: string
  originalRegulationTitle: string
  updatedRegulationId: string
  updatedRegulationTitle: string
  impact: ImpactAssessment
  affectedPolicyIds: string[]
  affectedPolicyTitles: string[]
  affectedInvestigationIds: string[]
  recommendedActions: string[]
  aiSummary: string
  supportingReferenceIds: string[]
  supportingReferenceTitles: string[]
}

export type InvestigationNotificationKind =
  | 'investigation_assigned'
  | 'due_soon'
  | 'regulatory_update'
  | 'evidence_uploaded'
  | 'review_requested'

export interface InvestigationNotification {
  id: string
  kind: InvestigationNotificationKind
  title: string
  body: string
  href: string
  read: boolean
  createdAt: string
  group: string
}

export interface InvestigationAiSuggestion {
  id: string
  investigationId: string
  kind: 'summarize' | 'next_action' | 'missing_evidence' | 'regulation' | 'risk' | 'summary_draft'
  title: string
  detail: string
  href?: string
}
