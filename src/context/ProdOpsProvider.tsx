import { useCallback, useMemo, useState, type ReactNode } from 'react'
import {
  ALERT_RULES,
  BACKUPS,
  BACKGROUND_JOBS,
  DASHBOARD_CARDS,
  DEPLOY_FLAGS,
  DEPLOYMENTS,
  HEALTH_SCORE,
  INCIDENTS,
  LOG_ENTRIES,
  MAINTENANCE_WINDOWS,
  OBS_METRICS,
  PLATFORM_TIMELINE,
  RECOVERY_POLICY,
  SERVICE_GRAPH,
  TRACES,
} from '../data/prodops/platform'
import { createId } from '../utils/id'
import type {
  AlertRule,
  BackupRecord,
  BackgroundJob,
  DeploymentRecord,
  FeatureFlagRef,
  IncidentRecord,
  IncidentStatus,
  OpsEnvironment,
} from '../types/prodops'
import { ProdOpsContext, type ProdOpsContextValue } from './ProdOpsContext'

export function ProdOpsProvider({ children }: { children: ReactNode }) {
  const [incidents, setIncidents] = useState<IncidentRecord[]>(INCIDENTS)
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(INCIDENTS[0]?.id ?? null)
  const [backups, setBackups] = useState<BackupRecord[]>(BACKUPS)
  const [jobs, setJobs] = useState<BackgroundJob[]>(BACKGROUND_JOBS)
  const [deployments, setDeployments] = useState<DeploymentRecord[]>(DEPLOYMENTS)
  const [featureFlags, setFeatureFlags] = useState<FeatureFlagRef[]>(DEPLOY_FLAGS)
  const [alerts, setAlerts] = useState<AlertRule[]>(ALERT_RULES)
  const [selectedEnvironment, setSelectedEnvironment] = useState<OpsEnvironment>('production')
  const [environment, setEnvironment] = useState<OpsEnvironment>('production')
  const [liveRefresh, setLiveRefresh] = useState(true)
  const [lastRefreshedAt, setLastRefreshedAt] = useState('2026-08-03T14:21:00.000Z')

  const activeIncidents = incidents.filter((item) => !['resolved', 'closed'].includes(item.status))
  const degraded = SERVICE_GRAPH.some((svc) => svc.status === 'degraded')
  const outage = SERVICE_GRAPH.some((svc) => svc.status === 'outage')
  const globalStatus: ProdOpsContextValue['globalStatus'] = outage
    ? 'outage'
    : activeIncidents.some((item) => item.severity === 'critical' || item.severity === 'high')
      ? 'degraded'
      : degraded
        ? 'degraded'
        : 'operational'

  const bumpRefresh = useCallback(() => {
    setLastRefreshedAt(new Date().toISOString())
  }, [])

  const updateIncidentStatus = useCallback((id: string, status: IncidentStatus) => {
    setIncidents((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              status,
              updatedAt: new Date().toISOString(),
              timeline: [
                {
                  id: createId('tl'),
                  at: new Date().toISOString(),
                  actor: 'Operator',
                  note: `Status → ${status}`,
                },
                ...item.timeline,
              ],
            }
          : item,
      ),
    )
  }, [])

  const createBackup = useCallback((kind: BackupRecord['kind']) => {
    const created: BackupRecord = {
      id: createId('bk'),
      name: `manual-${kind}-${Date.now()}`,
      kind,
      status: 'running',
      sizeLabel: '—',
      createdAt: new Date().toISOString(),
      location: 's3://ri-dr-east/manual',
      verifiedAt: null,
    }
    setBackups((current) => [created, ...current])
  }, [])

  const verifyBackup = useCallback((id: string) => {
    setBackups((current) =>
      current.map((item) =>
        item.id === id ? { ...item, status: 'verified', verifiedAt: new Date().toISOString() } : item,
      ),
    )
  }, [])

  const restoreBackup = useCallback((id: string) => {
    setBackups((current) =>
      current.map((item) => (item.id === id ? { ...item, status: item.status === 'failed' ? 'running' : item.status } : item)),
    )
  }, [])

  const simulateRestore = useCallback(() => {
    bumpRefresh()
    return `Restore simulation completed against staging. Estimated RTO ${RECOVERY_POLICY.rtoMinutes}m · RPO ${RECOVERY_POLICY.rpoMinutes}m.`
  }, [bumpRefresh])

  const rollbackDeployment = useCallback((id: string) => {
    setDeployments((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              status: 'rolled_back',
              version: item.previousVersion,
              previousVersion: item.version,
              deployedAt: new Date().toISOString(),
              healthVerified: true,
            }
          : item,
      ),
    )
  }, [])

  const approveDeployment = useCallback((id: string) => {
    setDeployments((current) =>
      current.map((item) => (item.id === id ? { ...item, status: 'approved' } : item)),
    )
  }, [])

  const value = useMemo<ProdOpsContextValue>(
    () => ({
      health: HEALTH_SCORE,
      cards: DASHBOARD_CARDS,
      services: SERVICE_GRAPH,
      jobs,
      maintenance: MAINTENANCE_WINDOWS,
      timeline: PLATFORM_TIMELINE,
      incidents,
      selectedIncidentId,
      selectIncident: setSelectedIncidentId,
      updateIncidentStatus,
      backups,
      recovery: RECOVERY_POLICY,
      createBackup,
      verifyBackup,
      restoreBackup,
      simulateRestore,
      deployments,
      selectedEnvironment,
      setSelectedEnvironment,
      rollbackDeployment,
      approveDeployment,
      featureFlags,
      toggleDeployFlag: (id) =>
        setFeatureFlags((current) =>
          current.map((flag) => (flag.id === id ? { ...flag, enabled: !flag.enabled } : flag)),
        ),
      metrics: OBS_METRICS,
      logs: LOG_ENTRIES,
      traces: TRACES,
      alerts,
      silenceAlert: (id, hours) =>
        setAlerts((current) =>
          current.map((alert) =>
            alert.id === id
              ? { ...alert, silencedUntil: new Date(Date.now() + hours * 3600_000).toISOString() }
              : alert,
          ),
        ),
      toggleAlert: (id) =>
        setAlerts((current) =>
          current.map((alert) => (alert.id === id ? { ...alert, enabled: !alert.enabled } : alert)),
        ),
      retryJob: (id) =>
        setJobs((current) =>
          current.map((job) =>
            job.id === id
              ? { ...job, status: 'running', attempts: job.attempts + 1, lastRunAt: new Date().toISOString() }
              : job,
          ),
        ),
      liveRefresh,
      toggleLiveRefresh: () => setLiveRefresh((value) => !value),
      environment,
      setEnvironment,
      globalStatus,
      lastRefreshedAt,
      bumpRefresh,
    }),
    [
      alerts,
      approveDeployment,
      backups,
      bumpRefresh,
      createBackup,
      deployments,
      environment,
      featureFlags,
      globalStatus,
      incidents,
      jobs,
      lastRefreshedAt,
      liveRefresh,
      restoreBackup,
      rollbackDeployment,
      selectedEnvironment,
      selectedIncidentId,
      simulateRestore,
      updateIncidentStatus,
      verifyBackup,
    ],
  )

  return <ProdOpsContext.Provider value={value}>{children}</ProdOpsContext.Provider>
}
