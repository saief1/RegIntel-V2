import { useCallback, useMemo, useState, type ReactNode } from 'react'
import {
  AUDIT_ENGAGEMENTS,
  AUDIT_FINDINGS,
  AUDIT_UNIVERSE,
  AUTOMATION_ACTION_CATALOG,
  AUTOMATION_RULES,
  AUTOMATION_RUNS,
  AUTOMATION_STEPS,
  DATA_JOBS,
  DATA_QUALITY,
  DATA_SOURCES,
  DUPLICATES,
  EVIDENCE_REQUESTS,
  FEATURE_FLAGS,
  GLOBAL_JOBS,
  IP_RESTRICTIONS,
  RECORD_HISTORY,
  RELEASE_NOTES,
  RETENTION_POLICIES,
  SECRETS,
  SECURITY_ALERTS,
  SYSTEM_ANNOUNCEMENTS,
  SYSTEM_SERVICES,
  TRUSTED_DEVICES,
} from '../data/operations/platform'
import { createId } from '../utils/id'
import type {
  AutomationRule,
  AutomationRun,
  DataJob,
  FeatureFlag,
  GlobalJob,
  SecurityAlert,
  SystemAnnouncement,
  ToastMessage,
  TrustedDevice,
} from '../types/operations'
import { OperationsContext, type OperationsContextValue } from './OperationsContext'

export function OperationsProvider({ children }: { children: ReactNode }) {
  const [dataJobs, setDataJobs] = useState<DataJob[]>(DATA_JOBS)
  const [securityAlerts, setSecurityAlerts] = useState<SecurityAlert[]>(SECURITY_ALERTS)
  const [trustedDevices, setTrustedDevices] = useState<TrustedDevice[]>(TRUSTED_DEVICES)
  const [ipRestrictions, setIpRestrictions] = useState(IP_RESTRICTIONS)
  const [automationRules, setAutomationRules] = useState<AutomationRule[]>(AUTOMATION_RULES)
  const [automationRuns, setAutomationRuns] = useState<AutomationRun[]>(AUTOMATION_RUNS)
  const [globalJobs, setGlobalJobs] = useState<GlobalJob[]>(GLOBAL_JOBS)
  const [featureFlags, setFeatureFlags] = useState<FeatureFlag[]>(FEATURE_FLAGS)
  const [announcements, setAnnouncements] = useState<SystemAnnouncement[]>(SYSTEM_ANNOUNCEMENTS)
  const [toasts, setToasts] = useState<ToastMessage[]>([
    {
      id: 'toast-boot',
      title: 'Platform ready',
      body: 'Enterprise operations services are online (simulated).',
      tone: 'success',
      createdAt: new Date().toISOString(),
    },
  ])
  const [maintenanceMode, setMaintenanceMode] = useState(false)

  const pushToast = useCallback((toast: Omit<ToastMessage, 'id' | 'createdAt'> & { createdAt?: string }) => {
    setToasts((current) => [
      {
        id: createId('toast'),
        createdAt: toast.createdAt ?? new Date().toISOString(),
        title: toast.title,
        body: toast.body,
        tone: toast.tone,
      },
      ...current,
    ].slice(0, 6))
  }, [])

  const retryDataJob = useCallback(
    (id: string) => {
      setDataJobs((current) =>
        current.map((job) =>
          job.id === id
            ? {
                ...job,
                status: 'retrying',
                attempt: Math.min(job.attempt + 1, job.maxAttempts),
                detail: 'Retry requested from Data Management Center',
              }
            : job,
        ),
      )
      pushToast({ title: 'Data job retry queued', tone: 'info' })
    },
    [pushToast],
  )

  const queueMockImport = useCallback(
    (kind: 'csv' | 'excel' | 'api') => {
      const job: DataJob = {
        id: createId('dj'),
        title: `Mock ${kind.toUpperCase()} import`,
        kind: 'import',
        status: 'queued',
        source: kind,
        createdAt: new Date().toISOString(),
        detail: 'Validation pending',
        attempt: 0,
        maxAttempts: 3,
      }
      setDataJobs((current) => [job, ...current])
      setGlobalJobs((current) => [
        {
          id: createId('gj'),
          name: job.title,
          queue: 'data',
          status: 'queued',
          depth: 1,
          updatedAt: job.createdAt,
          detail: job.detail,
          attempt: 0,
          maxAttempts: 3,
        },
        ...current,
      ])
      pushToast({ title: `${kind.toUpperCase()} import queued`, tone: 'success' })
    },
    [pushToast],
  )

  const value = useMemo<OperationsContextValue>(
    () => ({
      dataSources: DATA_SOURCES,
      dataJobs,
      dataQuality: DATA_QUALITY,
      retentionPolicies: RETENTION_POLICIES,
      duplicates: DUPLICATES,
      recordHistory: RECORD_HISTORY,
      retryDataJob,
      queueMockImport,
      securityAlerts,
      acknowledgeAlert: (id) => {
        setSecurityAlerts((current) =>
          current.map((alert) => (alert.id === id ? { ...alert, acknowledged: true } : alert)),
        )
        pushToast({ title: 'Security alert acknowledged', tone: 'info' })
      },
      trustedDevices,
      revokeDevice: (id) => {
        setTrustedDevices((current) => current.filter((device) => device.id !== id))
        pushToast({ title: 'Device revoked', tone: 'warning' })
      },
      ipRestrictions,
      toggleIpRestriction: (id) =>
        setIpRestrictions((current) =>
          current.map((item) => (item.id === id ? { ...item, enabled: !item.enabled } : item)),
        ),
      secrets: SECRETS,
      securityScore: 78,
      mfaCoverage: 92,
      audits: AUDIT_ENGAGEMENTS,
      findings: AUDIT_FINDINGS,
      evidenceRequests: EVIDENCE_REQUESTS,
      auditUniverse: AUDIT_UNIVERSE,
      automationRules,
      automationRuns,
      automationSteps: AUTOMATION_STEPS,
      actionCatalog: AUTOMATION_ACTION_CATALOG,
      toggleAutomation: (id) =>
        setAutomationRules((current) =>
          current.map((rule) => (rule.id === id ? { ...rule, enabled: !rule.enabled } : rule)),
        ),
      runAutomation: (id) => {
        const rule = automationRules.find((item) => item.id === id)
        if (!rule) return
        const run: AutomationRun = {
          id: createId('run'),
          ruleId: rule.id,
          ruleName: rule.name,
          status: 'running',
          at: new Date().toISOString(),
          detail: 'Manual run started',
          attempt: 1,
        }
        setAutomationRuns((current) => [run, ...current])
        pushToast({ title: `Automation running · ${rule.name}`, tone: 'info' })
      },
      publishAutomation: (input) => {
        const rule: AutomationRule = {
          id: createId('ar'),
          name: input.name.trim() || 'Untitled automation',
          description: input.description,
          enabled: true,
          trigger: input.trigger,
          conditions: input.conditions,
          actions: input.actions,
          approvalsRequired: input.approvalsRequired,
          successRate: 100,
          lastRunAt: undefined,
          template: false,
        }
        setAutomationRules((current) => [rule, ...current])
        pushToast({ title: 'Automation published', body: rule.name, tone: 'success' })
      },
      retryAutomationRun: (id) => {
        setAutomationRuns((current) =>
          current.map((run) =>
            run.id === id
              ? { ...run, status: 'retrying', attempt: run.attempt + 1, detail: 'Retry from Automation Studio' }
              : run,
          ),
        )
        pushToast({ title: 'Automation retry queued', tone: 'info' })
      },
      services: SYSTEM_SERVICES,
      globalJobs,
      retryGlobalJob: (id) => {
        setGlobalJobs((current) =>
          current.map((job) =>
            job.id === id
              ? {
                  ...job,
                  status: 'retrying',
                  attempt: Math.min(job.attempt + 1, job.maxAttempts),
                  detail: 'Retry from System Health Center',
                  updatedAt: new Date().toISOString(),
                }
              : job,
          ),
        )
        pushToast({ title: 'Background job retry queued', tone: 'info' })
      },
      featureFlags,
      toggleFeatureFlag: (id) => {
        setFeatureFlags((current) =>
          current.map((flag) => {
            if (flag.id !== id) return flag
            const enabled = !flag.enabled
            if (flag.key === 'maintenance.banner') setMaintenanceMode(enabled)
            return { ...flag, enabled }
          }),
        )
      },
      releaseNotes: RELEASE_NOTES,
      announcements,
      dismissAnnouncement: (id) => setAnnouncements((current) => current.filter((item) => item.id !== id)),
      maintenanceMode,
      toggleMaintenanceMode: () => {
        setMaintenanceMode((value) => {
          const next = !value
          setFeatureFlags((current) =>
            current.map((flag) => (flag.key === 'maintenance.banner' ? { ...flag, enabled: next } : flag)),
          )
          pushToast({
            title: next ? 'Maintenance mode enabled' : 'Maintenance mode disabled',
            tone: next ? 'warning' : 'success',
          })
          return next
        })
      },
      toasts,
      pushToast,
      dismissToast: (id) => setToasts((current) => current.filter((toast) => toast.id !== id)),
    }),
    [
      announcements,
      automationRules,
      automationRuns,
      dataJobs,
      featureFlags,
      globalJobs,
      ipRestrictions,
      maintenanceMode,
      pushToast,
      queueMockImport,
      retryDataJob,
      securityAlerts,
      toasts,
      trustedDevices,
    ],
  )

  return <OperationsContext.Provider value={value}>{children}</OperationsContext.Provider>
}
