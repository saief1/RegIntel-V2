import { createContext } from 'react'
import type {
  ApprovalDecision,
  ApprovalRequest,
  AuditEvent,
  AutomationRule,
  CalendarItem,
  CollaborationComment,
  ControlRecord,
  EnterpriseRole,
  ExportFormat,
  GeneratedReport,
  GovernanceEvidence,
  ImpactAnalysis,
  MappingCoverage,
  OrgBusinessUnit,
  OrgDepartment,
  OrgLocation,
  OrgTeam,
  Permission,
  PolicyRecord,
  PolicyVersion,
  ReportKind,
  RiskRecord,
  RoleAssignment,
  WorkflowDefinition,
  WorkflowNode,
} from '../types/governance'

export interface GovernanceContextValue {
  currentUserId: string
  can: (permission: Permission) => boolean
  roleLabel: string

  departments: OrgDepartment[]
  businessUnits: OrgBusinessUnit[]
  locations: OrgLocation[]
  teams: OrgTeam[]
  roles: EnterpriseRole[]
  roleAssignments: RoleAssignment[]
  controls: ControlRecord[]
  risks: RiskRecord[]

  policies: PolicyRecord[]
  versions: PolicyVersion[]
  getPolicy: (id: string) => PolicyRecord | undefined
  getVersions: (policyId: string) => PolicyVersion[]
  updatePolicyContent: (policyId: string, content: string, summary?: string) => void
  restoreVersion: (policyId: string, versionId: string) => void
  publishPolicy: (policyId: string) => void

  approvals: ApprovalRequest[]
  getApprovalForPolicy: (policyId: string) => ApprovalRequest | undefined
  decideApprovalStep: (approvalId: string, stepId: string, decision: ApprovalDecision, comments: string) => void

  workflows: WorkflowDefinition[]
  templates: WorkflowDefinition[]
  createWorkflowFromTemplate: (templateId: string, name?: string) => WorkflowDefinition
  updateWorkflowNodes: (workflowId: string, nodes: WorkflowNode[]) => void

  auditEvents: AuditEvent[]
  exportAuditTrail: () => string

  evidence: GovernanceEvidence[]
  addEvidence: (input: Omit<GovernanceEvidence, 'id' | 'createdAt' | 'aiMetadata' | 'uploadedById'> & { aiMetadata?: string }) => void

  comments: CollaborationComment[]
  addComment: (input: Omit<CollaborationComment, 'id' | 'createdAt' | 'reactions' | 'resolved'> & { resolved?: boolean }) => void
  toggleCommentResolved: (id: string) => void
  reactToComment: (id: string, emoji: string) => void

  automations: AutomationRule[]
  toggleAutomation: (id: string) => void
  runAutomation: (id: string) => void

  calendarItems: CalendarItem[]
  mappings: MappingCoverage[]
  impactAnalyses: ImpactAnalysis[]
  getImpact: (regulationId: string) => ImpactAnalysis | undefined

  reports: GeneratedReport[]
  generateReport: (kind: ReportKind, format?: ExportFormat) => GeneratedReport

  reviewWarnings: Array<{ policyId: string; title: string; nextReviewDate: string; daysUntil: number }>
}

export const GovernanceContext = createContext<GovernanceContextValue | null>(null)
