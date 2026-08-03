/**
 * Connected Enterprise domain (Sprint 9).
 * Local/mock only — production-ready shapes for future adapters.
 */

export type IntegrationStatus = 'connected' | 'degraded' | 'disconnected' | 'error' | 'syncing'
export type IntegrationHealth = 'healthy' | 'degraded' | 'unhealthy' | 'unknown'
export type SyncFrequency = 'realtime' | 'hourly' | 'daily' | 'weekly' | 'manual'

export interface IntegrationActivity {
  id: string
  at: string
  level: 'info' | 'warning' | 'error' | 'success'
  message: string
}

export interface IntegrationConnector {
  id: string
  name: string
  category: 'collaboration' | 'ticketing' | 'storage' | 'identity' | 'developer'
  status: IntegrationStatus
  health: IntegrationHealth
  lastSyncAt?: string
  ownerId: string
  connectedSince?: string
  permissions: string[]
  syncFrequency: SyncFrequency
  activity: IntegrationActivity[]
  errorHistory: string[]
}

export interface SyncQueueItem {
  id: string
  integrationId: string
  integrationName: string
  status: 'queued' | 'running' | 'retrying' | 'failed' | 'completed'
  attempt: number
  maxAttempts: number
  updatedAt: string
  detail: string
}

export interface ApiKeyRecord {
  id: string
  name: string
  prefix: string
  createdAt: string
  lastUsedAt?: string
  scopes: string[]
  status: 'active' | 'revoked'
}

export interface OAuthClient {
  id: string
  name: string
  clientId: string
  createdAt: string
  redirectUris: string[]
  scopes: string[]
}

export interface WebhookEndpoint {
  id: string
  url: string
  events: string[]
  status: 'active' | 'paused' | 'failing'
  secretPrefix: string
  lastDeliveryAt?: string
}

export interface WebhookEvent {
  id: string
  webhookId: string
  event: string
  status: 'delivered' | 'failed' | 'pending'
  at: string
  payloadSummary: string
}

export interface ApiUsagePoint {
  day: string
  requests: number
  errors: number
}

export interface MonitoringAgent {
  id: string
  regulator: string
  region: string
  status: 'active' | 'paused' | 'error'
  lastScanAt: string
  newPublications: number
  potentialImpact: 'low' | 'medium' | 'high' | 'critical'
  confidence: number
  recommendedActions: string[]
  generatedTaskTitles: string[]
  healthScore: number
}

export interface TeamChannel {
  id: string
  name: string
  description: string
  memberIds: string[]
  unread: number
}

export interface CollaborationAnnouncement {
  id: string
  title: string
  body: string
  tone: 'info' | 'warning' | 'critical'
  createdAt: string
  dismissible: boolean
}

export interface WatchlistItem {
  id: string
  kind: 'policy' | 'regulation'
  title: string
  href: string
  following: boolean
}

export interface DigestPreference {
  id: string
  label: string
  cadence: 'realtime' | 'daily' | 'weekly'
  enabled: boolean
}

export interface AdminUser {
  id: string
  name: string
  email: string
  role: string
  status: 'active' | 'invited' | 'suspended'
  lastLoginAt?: string
  mfaEnabled: boolean
}

export interface LoginHistoryItem {
  id: string
  userId: string
  at: string
  ip: string
  location: string
  result: 'success' | 'failure' | 'mfa_challenge'
}

export interface DeviceSession {
  id: string
  userId: string
  device: string
  browser: string
  lastActiveAt: string
  current: boolean
}

export interface GlobalActivityItem {
  id: string
  source: 'integration' | 'agent' | 'admin' | 'collaboration' | 'api'
  title: string
  detail: string
  at: string
  href?: string
}
