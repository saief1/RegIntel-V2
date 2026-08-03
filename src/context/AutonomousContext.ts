import { createContext } from 'react'
import type {
  ActivityTimelineItem,
  AutonomousQueueItem,
  CustomAgentDraft,
  ExecutiveBrief,
  ExecutiveMetricCard,
  GraphEdge,
  GraphNode,
  WorkforceAgent,
} from '../types/autonomous'

export interface AutonomousContextValue {
  agents: WorkforceAgent[]
  selectedAgentId: string | null
  selectAgent: (id: string | null) => void
  pauseAgent: (id: string) => void
  resumeAgent: (id: string) => void
  runAgentNow: (id: string) => void

  customAgents: CustomAgentDraft[]
  publishCustomAgent: (draft: Omit<CustomAgentDraft, 'id' | 'createdAt' | 'status' | 'steps'> & { steps?: string[] }) => CustomAgentDraft

  queue: AutonomousQueueItem[]
  selectedQueueIds: string[]
  toggleQueueSelection: (id: string) => void
  clearQueueSelection: () => void
  approveQueueItems: (ids: string[]) => void
  rejectQueueItems: (ids: string[]) => void
  setQueueState: (id: string, state: AutonomousQueueItem['state']) => void

  graphNodes: GraphNode[]
  graphEdges: GraphEdge[]

  executiveCards: ExecutiveMetricCard[]
  briefs: ExecutiveBrief[]
  regenerateBrief: (kind: ExecutiveBrief['kind']) => void

  activityTimeline: ActivityTimelineItem[]
  workflowSteps: readonly string[]
}

export const AutonomousContext = createContext<AutonomousContextValue | null>(null)
