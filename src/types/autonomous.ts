/**
 * Autonomous Compliance domain (Sprint 10).
 * Local/mock only — production-ready shapes for agent orchestration.
 */

export type WorkforceAgentStatus = 'active' | 'paused' | 'running' | 'error'
export type AgentHealth = 'healthy' | 'degraded' | 'unhealthy'
export type QueueItemState =
  | 'new'
  | 'pending_approval'
  | 'approved'
  | 'running'
  | 'waiting'
  | 'completed'
  | 'failed'
export type QueuePriority = 'low' | 'medium' | 'high' | 'critical'
export type AgentTrigger = 'schedule' | 'event' | 'manual' | 'threshold'
export type AgentOutput = 'tasks' | 'policy_draft' | 'report' | 'notification' | 'evidence_pack'
export type GraphNodeKind =
  | 'regulation'
  | 'policy'
  | 'control'
  | 'risk'
  | 'task'
  | 'evidence'
  | 'report'
  | 'business_unit'
  | 'vendor'
  | 'owner'

export interface AgentHistoryEntry {
  id: string
  at: string
  result: 'success' | 'failed' | 'partial'
  summary: string
  durationMinutes: number
  confidence: number
}

export interface AgentLogEntry {
  id: string
  at: string
  level: 'info' | 'warning' | 'error' | 'reasoning'
  message: string
}

export interface RetryHistoryEntry {
  id: string
  at: string
  attempt: number
  reason: string
  outcome: 'retried' | 'abandoned' | 'succeeded'
}

export interface WorkforceAgent {
  id: string
  name: string
  role: string
  description: string
  status: WorkforceAgentStatus
  health: AgentHealth
  confidence: number
  lastRunAt?: string
  tasksCompleted: number
  queueDepth: number
  currentJob?: string
  nextRunAt?: string
  estimatedCostUsd: number
  estimatedMinutes: number
  history: AgentHistoryEntry[]
  logs: AgentLogEntry[]
  retries: RetryHistoryEntry[]
  reasoningSummary: string
}

export interface CustomAgentDraft {
  id: string
  name: string
  description: string
  trigger: AgentTrigger
  knowledgeSources: string[]
  connectedSystems: string[]
  output: AgentOutput
  approvalsRequired: boolean
  schedule: string
  steps: string[]
  createdAt: string
  status: 'draft' | 'published'
}

export interface AutonomousQueueItem {
  id: string
  title: string
  state: QueueItemState
  priority: QueuePriority
  confidence: number
  estimatedMinutes: number
  estimatedCostUsd: number
  ownerId: string
  agentId: string
  linkedRegulation?: string
  linkedPolicy?: string
  suggestedActions: string[]
  reasoningSummary: string
  approvalRequired: boolean
  createdAt: string
  updatedAt: string
}

export interface GraphNode {
  id: string
  label: string
  kind: GraphNodeKind
  x: number
  y: number
  detail: string
  href?: string
}

export interface GraphEdge {
  id: string
  from: string
  to: string
  label: string
}

export interface ExecutiveBrief {
  id: string
  kind: 'daily' | 'weekly' | 'monthly'
  title: string
  generatedAt: string
  summary: string
  bullets: string[]
}

export interface ExecutiveMetricCard {
  id: string
  title: string
  value: string
  trend: string
  tone: 'neutral' | 'positive' | 'warning' | 'critical'
  detail: string
}

export interface ActivityTimelineItem {
  id: string
  at: string
  agentName: string
  title: string
  detail: string
  href?: string
}
