/**
 * Developer Platform domain types (Sprint 15).
 * Local/mock only — portal, API explorer, apps, webhooks, SDKs.
 */

export type ApiEnvironment = 'live' | 'sandbox'
export type ApiKeyStatus = 'active' | 'rotated' | 'revoked' | 'expired'
export type WebhookDeliveryStatus = 'success' | 'failed' | 'pending' | 'retried'
export type SdkLanguage = 'javascript' | 'typescript' | 'python' | 'java' | 'csharp' | 'go'
export type ApiCategory =
  | 'regulations'
  | 'policies'
  | 'controls'
  | 'tasks'
  | 'reports'
  | 'users'
  | 'organizations'
  | 'ai_agents'
  | 'workflows'

export interface DeveloperMetricCard {
  id: string
  label: string
  value: string
  hint: string
  tone: 'neutral' | 'success' | 'warning' | 'error'
}

export interface ApiHealthSnapshot {
  status: 'operational' | 'degraded' | 'outage'
  uptimePct: number
  p95LatencyMs: number
  errorRatePct: number
  rateLimitRemaining: number
  rateLimitMax: number
  requestsToday: number
  activeIntegrations: number
}

export interface DeveloperApiKey {
  id: string
  name: string
  environment: ApiEnvironment
  prefix: string
  maskedSecret: string
  permissions: string[]
  status: ApiKeyStatus
  expiresAt: string | null
  lastUsedAt: string | null
  createdAt: string
}

export interface OAuthApplication {
  id: string
  name: string
  clientId: string
  clientSecretMasked: string
  redirectUris: string[]
  scopes: string[]
  authorizedOrgs: string[]
  createdAt: string
  lastActivityAt: string
  status: 'active' | 'disabled'
}

export interface WebhookEndpoint {
  id: string
  name: string
  url: string
  secretMasked: string
  events: string[]
  enabled: boolean
  retryCount: number
  successRatePct: number
  lastDeliveryAt: string | null
}

export interface WebhookDelivery {
  id: string
  webhookId: string
  event: string
  status: WebhookDeliveryStatus
  attempt: number
  latencyMs: number
  payload: string
  responseCode: number | null
  deliveredAt: string
}

export interface ApiEndpointDoc {
  id: string
  category: ApiCategory
  method: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE'
  path: string
  summary: string
  description: string
  auth: string
  rateLimit: string
  pagination?: string
  filtering?: string
  requestExample: string
  responseExample: string
  errorCodes: Array<{ code: number; meaning: string }>
}

export interface RequestHistoryItem {
  id: string
  at: string
  method: string
  path: string
  status: number
  latencyMs: number
}

export interface SdkPackage {
  id: SdkLanguage
  label: string
  version: string
  install: string
  docsUrl: string
  description: string
}

export interface CliCommand {
  command: string
  description: string
}

export interface SampleProject {
  id: string
  title: string
  stack: string
  description: string
  repoHint: string
}

export interface ApiChangelogEntry {
  id: string
  version: string
  date: string
  summary: string
  breaking: boolean
}

export interface OpenApiPathSummary {
  path: string
  methods: string[]
  tag: string
  summary: string
}
