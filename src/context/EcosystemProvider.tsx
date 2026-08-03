import { useCallback, useMemo, useState, type ReactNode } from 'react'
import {
  BUILDER_STEPS,
  CUSTOM_INTEGRATIONS,
  ECOSYSTEM_ACTIVITY,
  LINEAGE_EDGES,
  LINEAGE_NODES,
  MARKETPLACE_CATEGORIES,
  MARKETPLACE_CONNECTORS,
  TWIN_DEPARTMENTS,
  TWIN_FORECAST,
  TWIN_SIMULATIONS,
  WORKFLOW_DEFINITION,
  WORKFLOW_VERSIONS,
} from '../data/ecosystem/platform'
import { createId } from '../utils/id'
import { clampZoom } from '../utils/graph'
import type {
  ActivityTimelineItem,
  CustomIntegrationDraft,
  MarketplaceConnector,
  WorkflowDefinition,
  WorkflowVersion,
} from '../types/ecosystem'
import { EcosystemContext, type EcosystemContextValue } from './EcosystemContext'

export function EcosystemProvider({ children }: { children: ReactNode }) {
  const [connectors, setConnectors] = useState<MarketplaceConnector[]>(MARKETPLACE_CONNECTORS)
  const [selectedConnectorId, setSelectedConnectorId] = useState<string | null>(MARKETPLACE_CONNECTORS[0]?.id ?? null)
  const [customIntegrations, setCustomIntegrations] = useState<CustomIntegrationDraft[]>(CUSTOM_INTEGRATIONS)
  const [workflow, setWorkflow] = useState<WorkflowDefinition>(WORKFLOW_DEFINITION)
  const [workflowVersions, setWorkflowVersions] = useState<WorkflowVersion[]>(WORKFLOW_VERSIONS)
  const [canvasZoom, setCanvasZoomState] = useState(1)
  const [canvasPan, setCanvasPan] = useState({ x: 0, y: 0 })
  const [selectedSimulationId, setSelectedSimulationId] = useState<string | null>(TWIN_SIMULATIONS[0]?.id ?? null)
  const [activity, setActivity] = useState<ActivityTimelineItem[]>(ECOSYSTEM_ACTIVITY)

  const pushActivity = useCallback((item: Omit<ActivityTimelineItem, 'id' | 'at'> & { at?: string }) => {
    setActivity((current) => [
      {
        id: createId('ea'),
        at: item.at ?? new Date().toISOString(),
        source: item.source,
        title: item.title,
        detail: item.detail,
        href: item.href,
      },
      ...current,
    ])
  }, [])

  const installConnector = useCallback(
    (id: string) => {
      setConnectors((current) =>
        current.map((item) =>
          item.id === id
            ? { ...item, state: 'installed', connectionStatus: 'disconnected', configSummary: 'Installed · awaiting enable' }
            : item,
        ),
      )
      pushActivity({ source: 'marketplace', title: 'Connector installed', detail: id, href: '/integrations/marketplace' })
    },
    [pushActivity],
  )

  const enableConnector = useCallback(
    (id: string) => {
      setConnectors((current) =>
        current.map((item) =>
          item.id === id
            ? {
                ...item,
                state: 'enabled',
                connectionStatus: 'connected',
                syncHistory: [
                  {
                    id: createId('sync'),
                    at: new Date().toISOString(),
                    result: 'success',
                    message: 'Initial sync completed',
                  },
                  ...item.syncHistory,
                ],
              }
            : item,
        ),
      )
      pushActivity({ source: 'integration', title: 'Connector enabled', detail: id, href: '/integrations/marketplace' })
    },
    [pushActivity],
  )

  const disableConnector = useCallback(
    (id: string) => {
      setConnectors((current) =>
        current.map((item) =>
          item.id === id ? { ...item, state: 'disabled', connectionStatus: 'disconnected' } : item,
        ),
      )
      pushActivity({ source: 'integration', title: 'Connector disabled', detail: id, href: '/integrations/marketplace' })
    },
    [pushActivity],
  )

  const validateWorkflow = useCallback(() => {
    const errors: string[] = []
    const hasTrigger = workflow.nodes.some((node) => node.type === 'trigger')
    const hasComplete = workflow.nodes.some((node) => node.type === 'complete')
    if (!hasTrigger) errors.push('Workflow requires a Trigger node')
    if (!hasComplete) errors.push('Workflow requires a Complete node')
    const nodeIds = new Set(workflow.nodes.map((node) => node.id))
    for (const edge of workflow.edges) {
      if (!nodeIds.has(edge.from) || !nodeIds.has(edge.to)) errors.push(`Broken edge ${edge.id}`)
    }
    setWorkflow((current) => ({ ...current, validationErrors: errors, updatedAt: new Date().toISOString() }))
    return errors
  }, [workflow.edges, workflow.nodes])

  const value = useMemo<EcosystemContextValue>(
    () => ({
      connectors,
      categories: MARKETPLACE_CATEGORIES,
      installConnector,
      enableConnector,
      disableConnector,
      updateConnectorConfig: (id, configSummary) =>
        setConnectors((current) =>
          current.map((item) => (item.id === id ? { ...item, configSummary } : item)),
        ),
      selectedConnectorId,
      selectConnector: setSelectedConnectorId,
      customIntegrations,
      builderSteps: BUILDER_STEPS,
      publishCustomIntegration: (input) => {
        const created: CustomIntegrationDraft = {
          ...input,
          id: createId('ci'),
          createdAt: new Date().toISOString(),
          status: 'published',
          steps: [...BUILDER_STEPS],
        }
        setCustomIntegrations((current) => [created, ...current])
        pushActivity({
          source: 'integration',
          title: 'Custom integration published',
          detail: created.name,
          href: '/integrations/builder',
        })
      },
      workflow,
      workflowVersions,
      moveWorkflowNode: (id, x, y) =>
        setWorkflow((current) => ({
          ...current,
          nodes: current.nodes.map((node) => (node.id === id ? { ...node, x, y } : node)),
          updatedAt: new Date().toISOString(),
        })),
      validateWorkflow,
      publishWorkflow: () => {
        const errors = validateWorkflow()
        if (errors.length > 0) return
        const nextVersion = workflow.version + 1
        setWorkflow((current) => ({ ...current, status: 'published', version: nextVersion }))
        setWorkflowVersions((current) => [
          {
            id: createId('wv'),
            workflowId: workflow.id,
            version: nextVersion,
            label: `Published v${nextVersion}`,
            createdAt: new Date().toISOString(),
            snapshotName: `v${nextVersion}-published`,
          },
          ...current,
        ])
        pushActivity({
          source: 'workflow',
          title: 'Workflow published',
          detail: `${workflow.name} v${nextVersion}`,
          href: '/automation/canvas',
        })
      },
      rollbackWorkflow: (versionId) => {
        const version = workflowVersions.find((item) => item.id === versionId)
        if (!version) return
        setWorkflow((current) => ({
          ...current,
          version: version.version,
          status: 'draft',
          updatedAt: new Date().toISOString(),
          validationErrors: [],
        }))
        pushActivity({
          source: 'workflow',
          title: 'Workflow rolled back',
          detail: version.label,
          href: '/automation/canvas',
        })
      },
      canvasZoom,
      setCanvasZoom: (zoom) => setCanvasZoomState(clampZoom(zoom)),
      canvasPan,
      setCanvasPan,
      lineageNodes: LINEAGE_NODES,
      lineageEdges: LINEAGE_EDGES,
      twinDepartments: TWIN_DEPARTMENTS,
      simulations: TWIN_SIMULATIONS,
      selectedSimulationId,
      selectSimulation: setSelectedSimulationId,
      twinForecast: TWIN_FORECAST,
      activity,
    }),
    [
      activity,
      canvasPan,
      canvasZoom,
      connectors,
      customIntegrations,
      disableConnector,
      enableConnector,
      installConnector,
      pushActivity,
      selectedConnectorId,
      selectedSimulationId,
      validateWorkflow,
      workflow,
      workflowVersions,
    ],
  )

  return <EcosystemContext.Provider value={value}>{children}</EcosystemContext.Provider>
}
