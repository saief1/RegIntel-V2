import { createContext } from 'react'
import type {
  ActivityTimelineItem,
  CustomIntegrationDraft,
  DigitalTwinDepartment,
  LineageEdge,
  LineageNode,
  MarketplaceCategory,
  MarketplaceConnector,
  TwinForecastPoint,
  TwinSimulation,
  WorkflowDefinition,
  WorkflowVersion,
} from '../types/ecosystem'

export interface EcosystemContextValue {
  connectors: MarketplaceConnector[]
  categories: Array<{ id: MarketplaceCategory; label: string }>
  installConnector: (id: string) => void
  enableConnector: (id: string) => void
  disableConnector: (id: string) => void
  updateConnectorConfig: (id: string, configSummary: string) => void
  selectedConnectorId: string | null
  selectConnector: (id: string | null) => void

  customIntegrations: CustomIntegrationDraft[]
  builderSteps: readonly string[]
  publishCustomIntegration: (input: Omit<CustomIntegrationDraft, 'id' | 'createdAt' | 'status' | 'steps'>) => void

  workflow: WorkflowDefinition
  workflowVersions: WorkflowVersion[]
  moveWorkflowNode: (id: string, x: number, y: number) => void
  validateWorkflow: () => string[]
  publishWorkflow: () => void
  rollbackWorkflow: (versionId: string) => void
  canvasZoom: number
  setCanvasZoom: (zoom: number) => void
  canvasPan: { x: number; y: number }
  setCanvasPan: (pan: { x: number; y: number }) => void

  lineageNodes: LineageNode[]
  lineageEdges: LineageEdge[]

  twinDepartments: DigitalTwinDepartment[]
  simulations: TwinSimulation[]
  selectedSimulationId: string | null
  selectSimulation: (id: string | null) => void
  twinForecast: TwinForecastPoint[]

  activity: ActivityTimelineItem[]
}

export const EcosystemContext = createContext<EcosystemContextValue | null>(null)
