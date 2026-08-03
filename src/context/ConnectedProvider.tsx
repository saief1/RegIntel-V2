import { useCallback, useMemo, useState, type ReactNode } from 'react'
import {
  ADMIN_USERS,
  ANNOUNCEMENTS,
  API_DOCS,
  API_KEYS,
  API_USAGE,
  DEVICE_SESSIONS,
  DIGESTS,
  GLOBAL_ACTIVITY,
  INTEGRATIONS,
  LOGIN_HISTORY,
  MONITORING_AGENTS,
  OAUTH_CLIENTS,
  SYNC_QUEUE,
  TEAM_CHANNELS,
  WATCHLIST,
  WEBHOOKS,
  WEBHOOK_EVENTS,
} from '../data/connected/platform'
import { createId } from '../utils/id'
import type {
  ApiKeyRecord,
  CollaborationAnnouncement,
  DigestPreference,
  GlobalActivityItem,
  IntegrationConnector,
  MonitoringAgent,
  SyncQueueItem,
  WatchlistItem,
} from '../types/connected'
import { ConnectedContext, type ConnectedContextValue } from './ConnectedContext'

export function ConnectedProvider({ children }: { children: ReactNode }) {
  const [integrations, setIntegrations] = useState<IntegrationConnector[]>(INTEGRATIONS)
  const [syncQueue, setSyncQueue] = useState<SyncQueueItem[]>(SYNC_QUEUE)
  const [selectedIntegrationId, setSelectedIntegrationId] = useState<string | null>(INTEGRATIONS[0]?.id ?? null)
  const [apiKeys, setApiKeys] = useState<ApiKeyRecord[]>(API_KEYS)
  const [agents, setAgents] = useState<MonitoringAgent[]>(MONITORING_AGENTS)
  const [announcements, setAnnouncements] = useState<CollaborationAnnouncement[]>(ANNOUNCEMENTS)
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>(WATCHLIST)
  const [digests, setDigests] = useState<DigestPreference[]>(DIGESTS)
  const [deviceSessions, setDeviceSessions] = useState(DEVICE_SESSIONS)
  const [tenantName, setTenantName] = useState('RegIntel Financial Group')
  const [ssoEnabled, setSsoEnabled] = useState(true)
  const [scimEnabled, setScimEnabled] = useState(false)
  const [mfaRequired, setMfaRequired] = useState(true)
  const [globalActivity, setGlobalActivity] = useState<GlobalActivityItem[]>(GLOBAL_ACTIVITY)

  const pushActivity = useCallback((item: Omit<GlobalActivityItem, 'id' | 'at'> & { at?: string }) => {
    setGlobalActivity((current) => [
      {
        id: createId('ga'),
        at: item.at ?? new Date().toISOString(),
        ...item,
      },
      ...current,
    ])
  }, [])

  const disconnectIntegration = useCallback(
    (id: string) => {
      setIntegrations((current) =>
        current.map((item) =>
          item.id === id
            ? {
                ...item,
                status: 'disconnected',
                health: 'unknown',
                activity: [
                  {
                    id: createId('act'),
                    at: new Date().toISOString(),
                    level: 'info',
                    message: 'Disconnected by administrator',
                  },
                  ...item.activity,
                ],
              }
            : item,
        ),
      )
      pushActivity({
        source: 'integration',
        title: 'Integration disconnected',
        detail: id,
        href: '/settings/integrations',
      })
    },
    [pushActivity],
  )

  const reconnectIntegration = useCallback(
    (id: string) => {
      setIntegrations((current) =>
        current.map((item) =>
          item.id === id
            ? {
                ...item,
                status: 'connected',
                health: 'healthy',
                lastSyncAt: new Date().toISOString(),
                connectedSince: item.connectedSince ?? new Date().toISOString(),
                activity: [
                  {
                    id: createId('act'),
                    at: new Date().toISOString(),
                    level: 'success',
                    message: 'Reconnected successfully',
                  },
                  ...item.activity,
                ],
              }
            : item,
        ),
      )
      pushActivity({
        source: 'integration',
        title: 'Integration reconnected',
        detail: id,
        href: '/settings/integrations',
      })
    },
    [pushActivity],
  )

  const retrySync = useCallback(
    (queueId: string) => {
      setSyncQueue((current) =>
        current.map((item) =>
          item.id === queueId
            ? {
                ...item,
                status: 'retrying',
                attempt: Math.min(item.attempt + 1, item.maxAttempts),
                updatedAt: new Date().toISOString(),
                detail: 'Retry requested from UI',
              }
            : item,
        ),
      )
      pushActivity({
        source: 'integration',
        title: 'Sync retry queued',
        detail: queueId,
        href: '/settings/integrations',
      })
    },
    [pushActivity],
  )

  const createApiKey = useCallback(
    (name: string) => {
      const key: ApiKeyRecord = {
        id: createId('key'),
        name: name.trim() || 'New API key',
        prefix: `ri_live_${Math.random().toString(36).slice(2, 6)}…${Math.random().toString(36).slice(2, 5)}`,
        createdAt: new Date().toISOString(),
        scopes: ['policies:read'],
        status: 'active',
      }
      setApiKeys((current) => [key, ...current])
      pushActivity({
        source: 'api',
        title: 'API key created',
        detail: key.name,
        href: '/settings/api',
      })
      return key
    },
    [pushActivity],
  )

  const revokeApiKey = useCallback(
    (id: string) => {
      setApiKeys((current) =>
        current.map((item) => (item.id === id ? { ...item, status: 'revoked' } : item)),
      )
      pushActivity({
        source: 'api',
        title: 'API key revoked',
        detail: id,
        href: '/settings/api',
      })
    },
    [pushActivity],
  )

  const toggleAgent = useCallback((id: string) => {
    setAgents((current) =>
      current.map((agent) =>
        agent.id === id
          ? {
              ...agent,
              status: agent.status === 'active' ? 'paused' : 'active',
            }
          : agent,
      ),
    )
  }, [])

  const runAgentScan = useCallback(
    (id: string) => {
      setAgents((current) =>
        current.map((agent) =>
          agent.id === id
            ? {
                ...agent,
                status: 'active',
                lastScanAt: new Date().toISOString(),
                newPublications: agent.newPublications + 1,
                healthScore: Math.min(99, agent.healthScore + 1),
              }
            : agent,
        ),
      )
      const agent = agents.find((item) => item.id === id)
      pushActivity({
        source: 'agent',
        title: `${agent?.regulator ?? 'Agent'} scan completed`,
        detail: 'Mock continuous monitoring cycle',
        href: '/ai/agents',
      })
    },
    [agents, pushActivity],
  )

  const value = useMemo<ConnectedContextValue>(
    () => ({
      integrations,
      syncQueue,
      disconnectIntegration,
      reconnectIntegration,
      retrySync,
      selectedIntegrationId,
      selectIntegration: setSelectedIntegrationId,
      apiKeys,
      oauthClients: OAUTH_CLIENTS,
      webhooks: WEBHOOKS,
      webhookEvents: WEBHOOK_EVENTS,
      apiUsage: API_USAGE,
      apiDocs: API_DOCS,
      createApiKey,
      revokeApiKey,
      rateLimit: { used: 640, limit: 1000, window: '15 minutes' },
      agents,
      toggleAgent,
      runAgentScan,
      channels: TEAM_CHANNELS,
      announcements,
      dismissAnnouncement: (id) => setAnnouncements((current) => current.filter((item) => item.id !== id)),
      watchlist,
      toggleWatch: (id) =>
        setWatchlist((current) =>
          current.map((item) => (item.id === id ? { ...item, following: !item.following } : item)),
        ),
      digests,
      toggleDigest: (id) =>
        setDigests((current) =>
          current.map((item) => (item.id === id ? { ...item, enabled: !item.enabled } : item)),
        ),
      mentionFeed: [
        {
          id: 'm-01',
          body: '@Alex Chen Please review section 4 on AML Policy.',
          href: '/knowledge/policies/pol-aml',
          at: '2026-08-02T16:30:00.000Z',
        },
        {
          id: 'm-02',
          body: '@Alex Chen Approval reminder for Cyber Policy.',
          href: '/knowledge/policies/pol-cyber',
          at: '2026-08-02T15:00:00.000Z',
        },
      ],
      adminUsers: ADMIN_USERS,
      loginHistory: LOGIN_HISTORY,
      deviceSessions,
      revokeSession: (id) => setDeviceSessions((current) => current.filter((item) => item.id !== id)),
      tenantName,
      setTenantName,
      ssoEnabled,
      toggleSso: () => setSsoEnabled((value) => !value),
      scimEnabled,
      toggleScim: () => setScimEnabled((value) => !value),
      mfaRequired,
      toggleMfaRequired: () => setMfaRequired((value) => !value),
      globalActivity,
    }),
    [
      agents,
      announcements,
      apiKeys,
      createApiKey,
      deviceSessions,
      digests,
      disconnectIntegration,
      globalActivity,
      integrations,
      mfaRequired,
      reconnectIntegration,
      retrySync,
      revokeApiKey,
      runAgentScan,
      scimEnabled,
      selectedIntegrationId,
      ssoEnabled,
      syncQueue,
      tenantName,
      toggleAgent,
      watchlist,
    ],
  )

  return <ConnectedContext.Provider value={value}>{children}</ConnectedContext.Provider>
}
