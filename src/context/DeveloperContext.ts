import { createContext } from 'react'
import type {
  ApiChangelogEntry,
  ApiEndpointDoc,
  ApiEnvironment,
  ApiHealthSnapshot,
  CliCommand,
  DeveloperApiKey,
  DeveloperMetricCard,
  OAuthApplication,
  OpenApiPathSummary,
  RequestHistoryItem,
  SampleProject,
  SdkPackage,
  WebhookDelivery,
  WebhookEndpoint,
} from '../types/developer'

export interface DeveloperContextValue {
  health: ApiHealthSnapshot
  metrics: DeveloperMetricCard[]
  apiKeys: DeveloperApiKey[]
  oauthApps: OAuthApplication[]
  webhooks: WebhookEndpoint[]
  deliveries: WebhookDelivery[]
  endpoints: ApiEndpointDoc[]
  categories: ReadonlyArray<{ id: string; label: string }>
  webhookEvents: readonly string[]
  requestHistory: RequestHistoryItem[]
  sdkPackages: SdkPackage[]
  cliCommands: CliCommand[]
  sampleProjects: SampleProject[]
  changelog: ApiChangelogEntry[]
  openApiPaths: OpenApiPathSummary[]
  openApiDocument: string
  apiVersion: string
  setApiVersion: (version: string) => void

  createApiKey: (input: { name: string; environment: ApiEnvironment; permissions: string[] }) => void
  rotateApiKey: (id: string) => void
  revokeApiKey: (id: string) => void
  createOAuthApp: (input: { name: string; redirectUris: string[]; scopes: string[] }) => void
  toggleWebhook: (id: string) => void
  replayDelivery: (id: string) => void
  runPlayground: (input: { method: string; path: string; body: string }) => string
  pushRequestHistory: (item: Omit<RequestHistoryItem, 'id' | 'at'> & { at?: string }) => void
  selectedEndpointId: string | null
  selectEndpoint: (id: string | null) => void
  selectedWebhookId: string | null
  selectWebhook: (id: string | null) => void
  selectedDeliveryId: string | null
  selectDelivery: (id: string | null) => void
}

export const DeveloperContext = createContext<DeveloperContextValue | null>(null)
