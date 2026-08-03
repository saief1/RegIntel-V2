/**
 * Production Operations domain (Sprint 16).
 * Local/mock only — ops center, incidents, backups, deployments, observability.
 */

export type OpsEnvironment = 'development' | 'qa' | 'staging' | 'production'
export type IncidentSeverity = 'critical' | 'high' | 'medium' | 'low'
export type IncidentStatus = 'open' | 'investigating' | 'monitoring' | 'resolved' | 'closed'
export type BackupKind = 'full' | 'incremental' | 'database' | 'files' | 'configuration'
export type BackupStatus = 'succeeded' | 'running' | 'failed' | 'verified'
export type DeploymentStatus = 'pending' | 'approved' | 'deploying' | 'healthy' | 'rolled_back' | 'failed'
export type AlertSeverity = 'critical' | 'warning' | 'info'

export interface OpsDashboardCard {
  id: string
  label: string
  value: string
  hint: string
  tone: 'neutral' | 'success' | 'warning' | 'error'
}

export interface PlatformHealthScore {
  score: number
  label: string
  uptimePct: number
  slaPct: number
}

export interface ServiceNode {
  id: string
  name: string
  status: 'operational' | 'degraded' | 'outage'
  dependsOn: string[]
}

export interface BackgroundJob {
  id: string
  name: string
  queue: string
  status: 'queued' | 'running' | 'succeeded' | 'failed' | 'retrying'
  depth: number
  lastRunAt: string
  attempts: number
}

export interface MaintenanceWindow {
  id: string
  title: string
  startsAt: string
  endsAt: string
  status: 'scheduled' | 'active' | 'completed'
}

export interface PlatformTimelineItem {
  id: string
  at: string
  title: string
  detail: string
  kind: 'incident' | 'deploy' | 'backup' | 'alert' | 'maintenance'
}

export interface IncidentAttachment {
  id: string
  name: string
  sizeLabel: string
}

export interface IncidentTimelineEntry {
  id: string
  at: string
  actor: string
  note: string
}

export interface IncidentRecord {
  id: string
  title: string
  severity: IncidentSeverity
  status: IncidentStatus
  owner: string
  impactedServices: string[]
  customerImpact: string
  rootCause: string
  mitigation: string
  postmortem: string
  aiSummary: string
  openedAt: string
  updatedAt: string
  attachments: IncidentAttachment[]
  timeline: IncidentTimelineEntry[]
}

export interface BackupRecord {
  id: string
  name: string
  kind: BackupKind
  status: BackupStatus
  sizeLabel: string
  createdAt: string
  location: string
  verifiedAt: string | null
}

export interface RecoveryPolicy {
  rpoMinutes: number
  rtoMinutes: number
  schedule: string
  retentionDays: number
  storageLocation: string
}

export interface DeploymentRecord {
  id: string
  environment: OpsEnvironment
  version: string
  previousVersion: string
  status: DeploymentStatus
  deployedAt: string
  deployedBy: string
  releaseNotes: string
  checklist: Array<{ id: string; label: string; done: boolean }>
  healthVerified: boolean
}

export interface FeatureFlagRef {
  id: string
  key: string
  enabled: boolean
  environment: OpsEnvironment
}

export interface MetricPoint {
  label: string
  value: number
}

export interface ObservabilityMetrics {
  cpu: MetricPoint[]
  memory: MetricPoint[]
  storagePct: number
  apiLatencyMs: MetricPoint[]
  errorRatePct: MetricPoint[]
  requests: MetricPoint[]
  queueDepth: MetricPoint[]
  aiUsage: MetricPoint[]
}

export interface LogEntry {
  id: string
  at: string
  level: 'info' | 'warn' | 'error' | 'debug'
  service: string
  message: string
}

export interface TraceSpan {
  id: string
  name: string
  service: string
  durationMs: number
  startMs: number
}

export interface TraceRecord {
  id: string
  path: string
  totalMs: number
  status: number
  spans: TraceSpan[]
  slow: boolean
}

export interface AlertRule {
  id: string
  name: string
  metric: string
  threshold: string
  severity: AlertSeverity
  notify: string[]
  escalation: string
  silencedUntil: string | null
  enabled: boolean
}
