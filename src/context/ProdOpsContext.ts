import { createContext } from 'react'
import type {
  AlertRule,
  BackupRecord,
  BackgroundJob,
  DeploymentRecord,
  FeatureFlagRef,
  IncidentRecord,
  IncidentStatus,
  LogEntry,
  MaintenanceWindow,
  ObservabilityMetrics,
  OpsDashboardCard,
  OpsEnvironment,
  PlatformHealthScore,
  PlatformTimelineItem,
  RecoveryPolicy,
  ServiceNode,
  TraceRecord,
} from '../types/prodops'

export interface ProdOpsContextValue {
  health: PlatformHealthScore
  cards: OpsDashboardCard[]
  services: ServiceNode[]
  jobs: BackgroundJob[]
  maintenance: MaintenanceWindow[]
  timeline: PlatformTimelineItem[]
  incidents: IncidentRecord[]
  selectedIncidentId: string | null
  selectIncident: (id: string | null) => void
  updateIncidentStatus: (id: string, status: IncidentStatus) => void
  backups: BackupRecord[]
  recovery: RecoveryPolicy
  createBackup: (kind: BackupRecord['kind']) => void
  verifyBackup: (id: string) => void
  restoreBackup: (id: string) => void
  simulateRestore: () => string
  deployments: DeploymentRecord[]
  selectedEnvironment: OpsEnvironment
  setSelectedEnvironment: (env: OpsEnvironment) => void
  rollbackDeployment: (id: string) => void
  approveDeployment: (id: string) => void
  featureFlags: FeatureFlagRef[]
  toggleDeployFlag: (id: string) => void
  metrics: ObservabilityMetrics
  logs: LogEntry[]
  traces: TraceRecord[]
  alerts: AlertRule[]
  silenceAlert: (id: string, hours: number) => void
  toggleAlert: (id: string) => void
  retryJob: (id: string) => void
  liveRefresh: boolean
  toggleLiveRefresh: () => void
  environment: OpsEnvironment
  setEnvironment: (env: OpsEnvironment) => void
  globalStatus: 'operational' | 'degraded' | 'outage' | 'maintenance'
  lastRefreshedAt: string
  bumpRefresh: () => void
}

export const ProdOpsContext = createContext<ProdOpsContextValue | null>(null)
