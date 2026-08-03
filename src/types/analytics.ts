/**
 * Enterprise Intelligence & Analytics domain (Sprint 11).
 * Local/mock only — production-ready shapes for executive reporting.
 */

export type DateRangeKey = '7d' | '30d' | '90d' | 'ytd'
export type ExportFormat = 'pdf' | 'csv' | 'xlsx'
export type ExportJobStatus = 'queued' | 'processing' | 'ready' | 'failed'
export type DashboardPermission = 'view' | 'edit' | 'admin'

export interface AnalyticsMetric {
  id: string
  label: string
  value: string
  delta: string
  tone: 'neutral' | 'positive' | 'warning' | 'critical'
  detail: string
}

export interface HeatmapCell {
  department: string
  riskArea: string
  score: number
}

export interface TrendPoint {
  label: string
  value: number
}

export interface DepartmentPerformance {
  id: string
  name: string
  businessUnit: string
  score: number
  coverage: number
  openApprovals: number
  evidenceCompleteness: number
}

export interface SavedDashboardView {
  id: string
  name: string
  dateRange: DateRangeKey
  businessUnit: string
  favorite: boolean
  shared: boolean
  permission: DashboardPermission
  createdAt: string
}

export interface KpiDefinition {
  id: string
  name: string
  description: string
  formula: string
  metrics: string[]
  thresholdWarn: number
  thresholdCritical: number
  currentValue: number
  goal: number
  unit: string
  alertEnabled: boolean
  schedule: string
  trend: TrendPoint[]
}

export interface PredictionItem {
  id: string
  title: string
  category:
    | 'workload'
    | 'audit'
    | 'department_risk'
    | 'resources'
    | 'deadlines'
    | 'policy_review'
    | 'agent_workload'
  confidence: number
  horizon: string
  forecast: string
  reasoning: string
  mitigation: string
}

export interface BoardSection {
  id: string
  title: string
  body: string
  bullets: string[]
}

export interface BoardTemplate {
  id: string
  name: string
  sectionOrder: string[]
  schedule?: string
  createdAt: string
}

export interface BoardPackageVersion {
  id: string
  title: string
  createdAt: string
  format: ExportFormat
  status: ExportJobStatus
}

export interface BenchmarkEntity {
  id: string
  name: string
  kind: 'department' | 'region' | 'business_unit' | 'product_line'
  complianceMaturity: number
  policyCoverage: number
  auditReadiness: number
  agentEfficiency: number
  workCompletion: number
  riskExposure: number
  reviewSpeed: number
}

export interface ImprovementOpportunity {
  id: string
  entityName: string
  metric: string
  gap: string
  recommendation: string
}

export interface ExportJob {
  id: string
  title: string
  format: ExportFormat
  status: ExportJobStatus
  createdAt: string
  destination: string
}

export interface ExecutiveBookmark {
  id: string
  label: string
  href: string
  createdAt: string
}

export interface ScheduledReport {
  id: string
  name: string
  cadence: string
  format: ExportFormat
  recipients: string
  nextRunAt: string
  enabled: boolean
}
