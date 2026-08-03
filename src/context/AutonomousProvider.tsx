import { useCallback, useMemo, useState, type ReactNode } from 'react'
import {
  AGENT_ACTIVITY_TIMELINE,
  AGENT_WORKFLOW_STEPS,
  AUTONOMOUS_QUEUE,
  CUSTOM_AGENTS,
  EXECUTIVE_BRIEFS,
  EXECUTIVE_CARDS,
  GRAPH_EDGES,
  GRAPH_NODES,
  WORKFORCE_AGENTS,
} from '../data/autonomous/platform'
import { createId } from '../utils/id'
import type {
  AutonomousQueueItem,
  CustomAgentDraft,
  ExecutiveBrief,
  WorkforceAgent,
} from '../types/autonomous'
import { AutonomousContext, type AutonomousContextValue } from './AutonomousContext'

export function AutonomousProvider({ children }: { children: ReactNode }) {
  const [agents, setAgents] = useState<WorkforceAgent[]>(WORKFORCE_AGENTS)
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(WORKFORCE_AGENTS[0]?.id ?? null)
  const [customAgents, setCustomAgents] = useState<CustomAgentDraft[]>(CUSTOM_AGENTS)
  const [queue, setQueue] = useState<AutonomousQueueItem[]>(AUTONOMOUS_QUEUE)
  const [selectedQueueIds, setSelectedQueueIds] = useState<string[]>([])
  const [briefs, setBriefs] = useState<ExecutiveBrief[]>(EXECUTIVE_BRIEFS)
  const [activityTimeline, setActivityTimeline] = useState(AGENT_ACTIVITY_TIMELINE)

  const pushTimeline = useCallback((item: Omit<(typeof AGENT_ACTIVITY_TIMELINE)[number], 'id' | 'at'> & { at?: string }) => {
    setActivityTimeline((current) => [
      {
        id: createId('tl'),
        at: item.at ?? new Date().toISOString(),
        agentName: item.agentName,
        title: item.title,
        detail: item.detail,
        href: item.href,
      },
      ...current,
    ])
  }, [])

  const pauseAgent = useCallback(
    (id: string) => {
      setAgents((current) =>
        current.map((agent) =>
          agent.id === id
            ? {
                ...agent,
                status: 'paused',
                currentJob: undefined,
                logs: [
                  { id: createId('log'), at: new Date().toISOString(), level: 'info', message: 'Paused by operator' },
                  ...agent.logs,
                ],
              }
            : agent,
        ),
      )
      const agent = agents.find((item) => item.id === id)
      pushTimeline({
        agentName: agent?.name ?? 'Agent',
        title: 'Agent paused',
        detail: 'Operator paused autonomous execution',
        href: '/agents',
      })
    },
    [agents, pushTimeline],
  )

  const resumeAgent = useCallback(
    (id: string) => {
      setAgents((current) =>
        current.map((agent) =>
          agent.id === id
            ? {
                ...agent,
                status: 'active',
                health: agent.health === 'unhealthy' ? 'degraded' : agent.health,
                nextRunAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
                logs: [
                  { id: createId('log'), at: new Date().toISOString(), level: 'info', message: 'Resumed by operator' },
                  ...agent.logs,
                ],
              }
            : agent,
        ),
      )
      const agent = agents.find((item) => item.id === id)
      pushTimeline({
        agentName: agent?.name ?? 'Agent',
        title: 'Agent resumed',
        detail: 'Scheduled runs re-enabled',
        href: '/agents',
      })
    },
    [agents, pushTimeline],
  )

  const runAgentNow = useCallback(
    (id: string) => {
      const now = new Date().toISOString()
      setAgents((current) =>
        current.map((agent) =>
          agent.id === id
            ? {
                ...agent,
                status: 'running',
                lastRunAt: now,
                tasksCompleted: agent.tasksCompleted + 1,
                currentJob: `Manual run · ${agent.name}`,
                confidence: Math.min(99, agent.confidence + 1),
                history: [
                  {
                    id: createId('hist'),
                    at: now,
                    result: 'success',
                    summary: 'Manual run completed (simulated)',
                    durationMinutes: agent.estimatedMinutes,
                    confidence: agent.confidence,
                  },
                  ...agent.history,
                ],
                logs: [
                  {
                    id: createId('log'),
                    at: now,
                    level: 'reasoning',
                    message: agent.reasoningSummary,
                  },
                  ...agent.logs,
                ],
              }
            : agent,
        ),
      )
      setQueue((current) => [
        {
          id: createId('aq'),
          title: `Follow-up from ${agents.find((a) => a.id === id)?.name ?? 'agent'}`,
          state: 'new',
          priority: 'medium',
          confidence: agents.find((a) => a.id === id)?.confidence ?? 80,
          estimatedMinutes: 15,
          estimatedCostUsd: 0.4,
          ownerId: 'u-01',
          agentId: id,
          suggestedActions: ['Review output', 'Approve next step'],
          reasoningSummary: 'Created by Run Now simulation.',
          approvalRequired: true,
          createdAt: now,
          updatedAt: now,
        },
        ...current,
      ])
      const agent = agents.find((item) => item.id === id)
      pushTimeline({
        agentName: agent?.name ?? 'Agent',
        title: 'Run now completed',
        detail: 'Background job simulation finished',
        href: '/agents/queue',
      })
    },
    [agents, pushTimeline],
  )

  const publishCustomAgent = useCallback(
    (draft: Omit<CustomAgentDraft, 'id' | 'createdAt' | 'status' | 'steps'> & { steps?: string[] }) => {
      const created: CustomAgentDraft = {
        id: createId('ca'),
        createdAt: new Date().toISOString(),
        status: 'published',
        steps: draft.steps ?? [...AGENT_WORKFLOW_STEPS],
        name: draft.name.trim() || 'Untitled agent',
        description: draft.description,
        trigger: draft.trigger,
        knowledgeSources: draft.knowledgeSources,
        connectedSystems: draft.connectedSystems,
        output: draft.output,
        approvalsRequired: draft.approvalsRequired,
        schedule: draft.schedule,
      }
      setCustomAgents((current) => [created, ...current])
      pushTimeline({
        agentName: created.name,
        title: 'Custom agent published',
        detail: created.description,
        href: '/agents/builder',
      })
      return created
    },
    [pushTimeline],
  )

  const approveQueueItems = useCallback(
    (ids: string[]) => {
      const now = new Date().toISOString()
      setQueue((current) =>
        current.map((item) =>
          ids.includes(item.id)
            ? { ...item, state: item.state === 'failed' ? 'new' : 'approved', updatedAt: now }
            : item,
        ),
      )
      setSelectedQueueIds([])
      pushTimeline({
        agentName: 'Autonomous Queue',
        title: 'Items approved',
        detail: `${ids.length} recommendation(s) approved`,
        href: '/agents/queue',
      })
    },
    [pushTimeline],
  )

  const rejectQueueItems = useCallback(
    (ids: string[]) => {
      const now = new Date().toISOString()
      setQueue((current) =>
        current.map((item) => (ids.includes(item.id) ? { ...item, state: 'failed', updatedAt: now } : item)),
      )
      setSelectedQueueIds([])
      pushTimeline({
        agentName: 'Autonomous Queue',
        title: 'Items rejected',
        detail: `${ids.length} recommendation(s) rejected`,
        href: '/agents/queue',
      })
    },
    [pushTimeline],
  )

  const regenerateBrief = useCallback((kind: ExecutiveBrief['kind']) => {
    const now = new Date().toISOString()
    setBriefs((current) =>
      current.map((brief) =>
        brief.kind === kind
          ? {
              ...brief,
              generatedAt: now,
              summary: `${brief.summary} (regenerated ${new Date(now).toLocaleString()})`,
            }
          : brief,
      ),
    )
  }, [])

  const value = useMemo<AutonomousContextValue>(
    () => ({
      agents,
      selectedAgentId,
      selectAgent: setSelectedAgentId,
      pauseAgent,
      resumeAgent,
      runAgentNow,
      customAgents,
      publishCustomAgent,
      queue,
      selectedQueueIds,
      toggleQueueSelection: (id) =>
        setSelectedQueueIds((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id])),
      clearQueueSelection: () => setSelectedQueueIds([]),
      approveQueueItems,
      rejectQueueItems,
      setQueueState: (id, state) =>
        setQueue((current) =>
          current.map((item) => (item.id === id ? { ...item, state, updatedAt: new Date().toISOString() } : item)),
        ),
      graphNodes: GRAPH_NODES,
      graphEdges: GRAPH_EDGES,
      executiveCards: EXECUTIVE_CARDS,
      briefs,
      regenerateBrief,
      activityTimeline,
      workflowSteps: AGENT_WORKFLOW_STEPS,
    }),
    [
      activityTimeline,
      agents,
      approveQueueItems,
      briefs,
      customAgents,
      pauseAgent,
      publishCustomAgent,
      queue,
      regenerateBrief,
      rejectQueueItems,
      resumeAgent,
      runAgentNow,
      selectedAgentId,
      selectedQueueIds,
    ],
  )

  return <AutonomousContext.Provider value={value}>{children}</AutonomousContext.Provider>
}
