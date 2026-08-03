/**
 * Connected Enterprise ecosystem domain (Sprint 13).
 * Local/mock only — marketplace, builder, workflow canvas, lineage, digital twin.
 */

export type MarketplaceCategory =
  | 'identity'
  | 'productivity'
  | 'ticketing'
  | 'cloud_storage'
  | 'communication'
  | 'crm'
  | 'hr'
  | 'erp'
  | 'security'
  | 'compliance'

export type ConnectorInstallState = 'available' | 'installed' | 'enabled' | 'disabled'

export interface MarketplaceConnector {
  id: string
  name: string
  category: MarketplaceCategory
  vendor: string
  description: string
  state: ConnectorInstallState
  connectionStatus: 'connected' | 'degraded' | 'disconnected' | 'unknown'
  permissions: string[]
  configSummary: string
  syncHistory: Array<{ id: string; at: string; result: 'success' | 'warning' | 'error'; message: string }>
}

export type BuilderProtocol = 'rest' | 'graphql' | 'webhook' | 'scheduled_sync'

export interface CustomIntegrationDraft {
  id: string
  name: string
  protocol: BuilderProtocol
  authType: 'oauth2' | 'api_key' | 'basic' | 'none'
  endpoint: string
  mapping: string
  transformation: string
  validation: string
  schedule?: string
  createdAt: string
  status: 'draft' | 'published'
  steps: string[]
}

export type WorkflowNodeType =
  | 'trigger'
  | 'decision'
  | 'ai'
  | 'approval'
  | 'human_task'
  | 'agent'
  | 'notification'
  | 'api'
  | 'report'
  | 'delay'
  | 'parallel'
  | 'merge'
  | 'complete'

export interface WorkflowCanvasNode {
  id: string
  type: WorkflowNodeType
  label: string
  x: number
  y: number
}

export interface WorkflowCanvasEdge {
  id: string
  from: string
  to: string
  label?: string
}

export interface WorkflowDefinition {
  id: string
  name: string
  version: number
  status: 'draft' | 'published' | 'archived'
  nodes: WorkflowCanvasNode[]
  edges: WorkflowCanvasEdge[]
  updatedAt: string
  validationErrors: string[]
}

export interface WorkflowVersion {
  id: string
  workflowId: string
  version: number
  label: string
  createdAt: string
  snapshotName: string
}

export type LineageKind =
  | 'regulation'
  | 'policy'
  | 'control'
  | 'risk'
  | 'finding'
  | 'task'
  | 'evidence'
  | 'report'

export interface LineageNode {
  id: string
  label: string
  kind: LineageKind
  x: number
  y: number
  origin: string
  lastChangedBy: string
  lastChangedAt: string
  changeSummary: string
  href?: string
}

export interface LineageEdge {
  id: string
  from: string
  to: string
  label: string
}

export interface ActivityTimelineItem {
  id: string
  at: string
  source: 'integration' | 'workflow' | 'lineage' | 'twin' | 'marketplace'
  title: string
  detail: string
  href?: string
}

export interface DigitalTwinDepartment {
  id: string
  name: string
  reviewers: number
  maturity: number
  openRisks: number
  workloadHours: number
  bottleneck: string
}

export interface TwinSimulation {
  id: string
  label: string
  description: string
  impact: {
    cycleTimeDeltaPct: number
    riskDelta: number
    capacityDeltaPct: number
    coverageDeltaPct: number
    summary: string
  }
}

export interface TwinForecastPoint {
  label: string
  baseline: number
  simulated: number
}
