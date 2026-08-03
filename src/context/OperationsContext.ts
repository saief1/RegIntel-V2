import { createContext } from 'react'
import type {
  AuditEngagement,
  AuditFinding,
  AutomationRule,
  AutomationRun,
  DataJob,
  DataQualityMetric,
  DataSource,
  DuplicateGroup,
  EvidenceRequest,
  FeatureFlag,
  GlobalJob,
  IpRestriction,
  RecordHistoryItem,
  ReleaseNote,
  RetentionPolicy,
  SecretRecord,
  SecurityAlert,
  SystemAnnouncement,
  SystemServiceHealth,
  ToastMessage,
  TrustedDevice,
} from '../types/operations'

export interface OperationsContextValue {
  dataSources: DataSource[]
  dataJobs: DataJob[]
  dataQuality: DataQualityMetric[]
  retentionPolicies: RetentionPolicy[]
  duplicates: DuplicateGroup[]
  recordHistory: RecordHistoryItem[]
  retryDataJob: (id: string) => void
  queueMockImport: (kind: 'csv' | 'excel' | 'api') => void

  securityAlerts: SecurityAlert[]
  acknowledgeAlert: (id: string) => void
  trustedDevices: TrustedDevice[]
  revokeDevice: (id: string) => void
  ipRestrictions: IpRestriction[]
  toggleIpRestriction: (id: string) => void
  secrets: SecretRecord[]
  securityScore: number
  mfaCoverage: number

  audits: AuditEngagement[]
  findings: AuditFinding[]
  evidenceRequests: EvidenceRequest[]
  auditUniverse: readonly string[]

  automationRules: AutomationRule[]
  automationRuns: AutomationRun[]
  automationSteps: readonly string[]
  actionCatalog: readonly string[]
  toggleAutomation: (id: string) => void
  runAutomation: (id: string) => void
  publishAutomation: (input: {
    name: string
    description: string
    trigger: string
    conditions: string[]
    actions: string[]
    approvalsRequired: boolean
  }) => void
  retryAutomationRun: (id: string) => void

  services: SystemServiceHealth[]
  globalJobs: GlobalJob[]
  retryGlobalJob: (id: string) => void
  featureFlags: FeatureFlag[]
  toggleFeatureFlag: (id: string) => void
  releaseNotes: ReleaseNote[]
  announcements: SystemAnnouncement[]
  dismissAnnouncement: (id: string) => void
  maintenanceMode: boolean
  toggleMaintenanceMode: () => void

  toasts: ToastMessage[]
  pushToast: (toast: Omit<ToastMessage, 'id' | 'createdAt'> & { createdAt?: string }) => void
  dismissToast: (id: string) => void
}

export const OperationsContext = createContext<OperationsContextValue | null>(null)
