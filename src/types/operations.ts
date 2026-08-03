/**
 * Enterprise Platform & Production Readiness domain (Sprint 12).
 * Local/mock only — shapes ready for real services later.
 */

export type JobStatus = 'queued' | 'running' | 'retrying' | 'succeeded' | 'failed' | 'cancelled'
export type ImportSourceKind = 'csv' | 'excel' | 'api' | 'schedule'
export type DataQualityStatus = 'healthy' | 'warning' | 'critical'
export type AuditLifecycleStage =
  | 'planning'
  | 'fieldwork'
  | 'reporting'
  | 'remediation'
  | 'closed'
export type AutomationStep = 'Trigger' | 'Conditions' | 'Actions' | 'Approvals' | 'Notifications' | 'Complete'

export interface DataSource {
  id: string
  name: string
  kind: ImportSourceKind
  owner: string
  lastSyncAt?: string
  status: 'connected' | 'degraded' | 'disconnected'
  records: number
}

export interface DataJob {
  id: string
  title: string
  kind: 'import' | 'export' | 'archive' | 'restore' | 'validation'
  status: JobStatus
  source?: string
  createdAt: string
  detail: string
  attempt: number
  maxAttempts: number
}

export interface DataQualityMetric {
  id: string
  label: string
  value: string
  status: DataQualityStatus
  detail: string
}

export interface RetentionPolicy {
  id: string
  name: string
  retentionDays: number
  archiveAfterDays: number
  appliesTo: string
}

export interface DuplicateGroup {
  id: string
  entity: string
  count: number
  confidence: number
  sample: string
}

export interface RecordHistoryItem {
  id: string
  entity: string
  action: string
  actor: string
  at: string
}

export interface SecurityAlert {
  id: string
  title: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  at: string
  acknowledged: boolean
  detail: string
  riskScore: number
}

export interface TrustedDevice {
  id: string
  name: string
  user: string
  lastSeenAt: string
  trusted: boolean
}

export interface IpRestriction {
  id: string
  cidr: string
  label: string
  enabled: boolean
}

export interface SecretRecord {
  id: string
  name: string
  lastRotatedAt: string
  status: 'active' | 'expiring' | 'rotated'
}

export interface AuditEngagement {
  id: string
  title: string
  stage: AuditLifecycleStage
  owner: string
  startDate: string
  endDate?: string
  findingsOpen: number
}

export interface AuditFinding {
  id: string
  auditId: string
  title: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  status: 'open' | 'in_progress' | 'closed'
  recommendation: string
  correctiveAction?: string
}

export interface EvidenceRequest {
  id: string
  auditId: string
  title: string
  dueAt: string
  status: 'requested' | 'received' | 'overdue'
}

export interface AutomationRule {
  id: string
  name: string
  description: string
  enabled: boolean
  trigger: string
  conditions: string[]
  actions: string[]
  approvalsRequired: boolean
  successRate: number
  lastRunAt?: string
  template?: boolean
}

export interface AutomationRun {
  id: string
  ruleId: string
  ruleName: string
  status: JobStatus
  at: string
  detail: string
  attempt: number
}

export interface SystemServiceHealth {
  id: string
  name: string
  category: 'platform' | 'integration' | 'api' | 'ai' | 'storage' | 'cache' | 'queue'
  status: 'operational' | 'degraded' | 'outage'
  latencyMs: number
  uptime: string
}

export interface GlobalJob {
  id: string
  name: string
  queue: string
  status: JobStatus
  depth?: number
  updatedAt: string
  detail: string
  attempt: number
  maxAttempts: number
}

export interface FeatureFlag {
  id: string
  key: string
  description: string
  enabled: boolean
}

export interface ReleaseNote {
  id: string
  version: string
  title: string
  publishedAt: string
  highlights: string[]
}

export interface SystemAnnouncement {
  id: string
  title: string
  body: string
  tone: 'info' | 'warning' | 'critical'
  dismissible: boolean
}

export interface ToastMessage {
  id: string
  title: string
  body?: string
  tone: 'info' | 'success' | 'warning' | 'error'
  createdAt: string
}
