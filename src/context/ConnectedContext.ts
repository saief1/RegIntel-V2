import { createContext } from 'react'
import type {
  AdminUser,
  ApiKeyRecord,
  ApiUsagePoint,
  CollaborationAnnouncement,
  DeviceSession,
  DigestPreference,
  GlobalActivityItem,
  IntegrationConnector,
  LoginHistoryItem,
  MonitoringAgent,
  OAuthClient,
  SyncQueueItem,
  TeamChannel,
  WatchlistItem,
  WebhookEndpoint,
  WebhookEvent,
} from '../types/connected'

export interface ConnectedContextValue {
  integrations: IntegrationConnector[]
  syncQueue: SyncQueueItem[]
  disconnectIntegration: (id: string) => void
  reconnectIntegration: (id: string) => void
  retrySync: (queueId: string) => void
  selectedIntegrationId: string | null
  selectIntegration: (id: string | null) => void

  apiKeys: ApiKeyRecord[]
  oauthClients: OAuthClient[]
  webhooks: WebhookEndpoint[]
  webhookEvents: WebhookEvent[]
  apiUsage: ApiUsagePoint[]
  apiDocs: string
  createApiKey: (name: string) => ApiKeyRecord
  revokeApiKey: (id: string) => void
  rateLimit: { used: number; limit: number; window: string }

  agents: MonitoringAgent[]
  toggleAgent: (id: string) => void
  runAgentScan: (id: string) => void

  channels: TeamChannel[]
  announcements: CollaborationAnnouncement[]
  dismissAnnouncement: (id: string) => void
  watchlist: WatchlistItem[]
  toggleWatch: (id: string) => void
  digests: DigestPreference[]
  toggleDigest: (id: string) => void
  mentionFeed: Array<{ id: string; body: string; href: string; at: string }>

  adminUsers: AdminUser[]
  loginHistory: LoginHistoryItem[]
  deviceSessions: DeviceSession[]
  revokeSession: (id: string) => void
  tenantName: string
  setTenantName: (name: string) => void
  ssoEnabled: boolean
  toggleSso: () => void
  scimEnabled: boolean
  toggleScim: () => void
  mfaRequired: boolean
  toggleMfaRequired: () => void

  globalActivity: GlobalActivityItem[]
}

export const ConnectedContext = createContext<ConnectedContextValue | null>(null)
