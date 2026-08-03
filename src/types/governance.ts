/**
 * Enterprise governance domain (Sprint 8).
 * Local/mock only — structured for future API adapters.
 */

export type PolicyStatus = 'draft' | 'in_review' | 'approved' | 'published' | 'archived'
export type ApprovalDecision = 'pending' | 'approved' | 'rejected' | 'deferred'
export type ApprovalStepKind = 'manager' | 'compliance' | 'executive' | 'legal' | 'custom'
export type ReviewCadence = 'annual' | 'quarterly' | 'monthly' | 'custom'
export type AuditAction =
  | 'created'
  | 'edited'
  | 'ai_suggested'
  | 'approved'
  | 'rejected'
  | 'published'
  | 'archived'
  | 'restored'
  | 'commented'
  | 'exported'
  | 'assigned'
  | 'automated'
export type EnterpriseRoleId =
  | 'administrator'
  | 'compliance_officer'
  | 'compliance_manager'
  | 'risk_manager'
  | 'executive'
  | 'auditor'
  | 'read_only'
export type Permission =
  | 'view'
  | 'edit'
  | 'delete'
  | 'approve'
  | 'export'
  | 'manage'
export type WorkflowNodeType =
  | 'trigger'
  | 'ai_analysis'
  | 'create_tasks'
  | 'assign_owners'
  | 'policy_update'
  | 'approval'
  | 'training'
  | 'completed'
  | 'notify'
  | 'checklist'
export type EvidenceFileKind = 'pdf' | 'word' | 'excel' | 'screenshot' | 'email' | 'note' | 'url'
export type CalendarEventKind =
  | 'review'
  | 'approval'
  | 'task'
  | 'board'
  | 'training'
  | 'deadline'
  | 'audit'
export type ReportKind =
  | 'board'
  | 'executive_summary'
  | 'compliance_status'
  | 'audit_evidence'
  | 'policy_review'
  | 'implementation'
export type ExportFormat = 'pdf' | 'word' | 'powerpoint' | 'markdown'

export interface OrgDepartment {
  id: string
  name: string
  managerId: string
}

export interface OrgBusinessUnit {
  id: string
  name: string
  departmentIds: string[]
}

export interface OrgLocation {
  id: string
  name: string
  region: string
}

export interface OrgTeam {
  id: string
  name: string
  departmentId: string
  leadId: string
  memberIds: string[]
}

export interface EnterpriseRole {
  id: EnterpriseRoleId
  label: string
  description: string
  permissions: Permission[]
}

export interface RoleAssignment {
  userId: string
  roleId: EnterpriseRoleId
  departmentId?: string
}

export interface PolicyVersion {
  id: string
  policyId: string
  version: string
  label: string
  content: string
  summary: string
  createdAt: string
  createdById: string
  isCurrent: boolean
}

export interface PolicyRecord {
  id: string
  title: string
  ownerId: string
  departmentId: string
  status: PolicyStatus
  effectiveDate: string
  reviewDate: string
  nextReviewDate: string
  reviewCadence: ReviewCadence
  linkedRegulationIds: string[]
  linkedControlIds: string[]
  linkedRiskIds: string[]
  currentVersionId: string
  approvalStatus: ApprovalDecision
  content: string
  createdAt: string
  updatedAt: string
}

export interface ApprovalStep {
  id: string
  kind: ApprovalStepKind
  label: string
  approverId: string
  decision: ApprovalDecision
  comments: string
  decidedAt?: string
}

export interface ApprovalRequest {
  id: string
  objectType: 'policy' | 'task' | 'report' | 'workflow'
  objectId: string
  title: string
  status: ApprovalDecision
  steps: ApprovalStep[]
  createdAt: string
  updatedAt: string
}

export interface WorkflowNode {
  id: string
  type: WorkflowNodeType
  label: string
  order: number
}

export interface WorkflowDefinition {
  id: string
  name: string
  description: string
  templateId?: string
  nodes: WorkflowNode[]
  isTemplate: boolean
  updatedAt: string
}

export interface AuditEvent {
  id: string
  action: AuditAction
  objectType: string
  objectId: string
  objectTitle: string
  actorId: string
  detail: string
  createdAt: string
}

export interface GovernanceEvidence {
  id: string
  title: string
  kind: EvidenceFileKind
  objectType: 'task' | 'policy' | 'approval'
  objectId: string
  url?: string
  note?: string
  aiMetadata: string
  uploadedById: string
  createdAt: string
}

export interface CollaborationComment {
  id: string
  objectType: 'policy' | 'task' | 'approval'
  objectId: string
  authorId: string
  body: string
  mentionIds: string[]
  resolved: boolean
  reactions: Record<string, string[]>
  attachmentIds: string[]
  parentId?: string
  createdAt: string
}

export interface AutomationRule {
  id: string
  name: string
  enabled: boolean
  trigger: string
  actions: string[]
  lastRunAt?: string
}

export interface CalendarItem {
  id: string
  title: string
  kind: CalendarEventKind
  date: string
  href: string
  ownerId?: string
}

export interface ControlRecord {
  id: string
  name: string
  ownerId: string
  status: 'effective' | 'gap' | 'testing'
}

export interface RiskRecord {
  id: string
  name: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  ownerId: string
}

export interface MappingCoverage {
  regulationId: string
  regulationTitle: string
  policyIds: string[]
  controlIds: string[]
  taskIds: string[]
  riskIds: string[]
  coveragePercent: number
  gaps: string[]
}

export interface ImpactAnalysis {
  regulationId: string
  regulationTitle: string
  affectedPolicies: string[]
  affectedProcedures: string[]
  affectedControls: string[]
  affectedVendors: string[]
  affectedTasks: string[]
  estimatedWorkItems: number
  estimatedHours: number
  recommendedOwnerIds: string[]
}

export interface GeneratedReport {
  id: string
  kind: ReportKind
  title: string
  summary: string
  createdAt: string
  createdById: string
  format: ExportFormat
}
