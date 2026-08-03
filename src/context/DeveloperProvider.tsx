import { useCallback, useMemo, useState, type ReactNode } from 'react'
import {
  API_CATEGORIES,
  API_CHANGELOG,
  API_ENDPOINTS,
  API_HEALTH,
  CLI_COMMANDS,
  DEVELOPER_API_KEYS,
  OAUTH_APPS,
  OPENAPI_MOCK,
  OPENAPI_PATHS,
  PORTAL_METRICS,
  REQUEST_HISTORY,
  SAMPLE_PROJECTS,
  SDK_PACKAGES,
  WEBHOOK_DELIVERIES,
  WEBHOOK_ENDPOINTS,
  WEBHOOK_EVENT_TYPES,
} from '../data/developer/platform'
import { createId } from '../utils/id'
import type {
  ApiEnvironment,
  DeveloperApiKey,
  OAuthApplication,
  RequestHistoryItem,
  WebhookDelivery,
  WebhookEndpoint,
} from '../types/developer'
import { DeveloperContext, type DeveloperContextValue } from './DeveloperContext'

export function DeveloperProvider({ children }: { children: ReactNode }) {
  const [apiKeys, setApiKeys] = useState<DeveloperApiKey[]>(DEVELOPER_API_KEYS)
  const [oauthApps, setOauthApps] = useState<OAuthApplication[]>(OAUTH_APPS)
  const [webhooks, setWebhooks] = useState<WebhookEndpoint[]>(WEBHOOK_ENDPOINTS)
  const [deliveries, setDeliveries] = useState<WebhookDelivery[]>(WEBHOOK_DELIVERIES)
  const [requestHistory, setRequestHistory] = useState<RequestHistoryItem[]>(REQUEST_HISTORY)
  const [apiVersion, setApiVersion] = useState('v1.5')
  const [selectedEndpointId, setSelectedEndpointId] = useState<string | null>(API_ENDPOINTS[0]?.id ?? null)
  const [selectedWebhookId, setSelectedWebhookId] = useState<string | null>(WEBHOOK_ENDPOINTS[0]?.id ?? null)
  const [selectedDeliveryId, setSelectedDeliveryId] = useState<string | null>(WEBHOOK_DELIVERIES[0]?.id ?? null)

  const pushRequestHistory = useCallback((item: Omit<RequestHistoryItem, 'id' | 'at'> & { at?: string }) => {
    setRequestHistory((current) => [
      {
        id: createId('rh'),
        at: item.at ?? new Date().toISOString(),
        method: item.method,
        path: item.path,
        status: item.status,
        latencyMs: item.latencyMs,
      },
      ...current,
    ].slice(0, 40))
  }, [])

  const createApiKey = useCallback((input: { name: string; environment: ApiEnvironment; permissions: string[] }) => {
    const prefix = input.environment === 'live' ? 'ri_live_' : 'ri_test_'
    const created: DeveloperApiKey = {
      id: createId('key'),
      name: input.name.trim(),
      environment: input.environment,
      prefix,
      maskedSecret: `${prefix}••••••••••••${Math.random().toString(16).slice(2, 6)}`,
      permissions: input.permissions,
      status: 'active',
      expiresAt: input.environment === 'live' ? new Date(Date.now() + 1000 * 60 * 60 * 24 * 365).toISOString() : null,
      lastUsedAt: null,
      createdAt: new Date().toISOString(),
    }
    setApiKeys((current) => [created, ...current])
  }, [])

  const rotateApiKey = useCallback((id: string) => {
    setApiKeys((current) =>
      current.map((key) =>
        key.id === id
          ? {
              ...key,
              status: 'rotated',
              maskedSecret: `${key.prefix}••••••••••••${Math.random().toString(16).slice(2, 6)}`,
              lastUsedAt: new Date().toISOString(),
            }
          : key,
      ),
    )
  }, [])

  const revokeApiKey = useCallback((id: string) => {
    setApiKeys((current) => current.map((key) => (key.id === id ? { ...key, status: 'revoked' } : key)))
  }, [])

  const createOAuthApp = useCallback((input: { name: string; redirectUris: string[]; scopes: string[] }) => {
    const created: OAuthApplication = {
      id: createId('oauth'),
      name: input.name.trim(),
      clientId: `ri_app_${Math.random().toString(16).slice(2, 8)}`,
      clientSecretMasked: `ri_sec_••••••••••••${Math.random().toString(16).slice(2, 6)}`,
      redirectUris: input.redirectUris,
      scopes: input.scopes,
      authorizedOrgs: ['Contoso Wealth'],
      createdAt: new Date().toISOString(),
      lastActivityAt: new Date().toISOString(),
      status: 'active',
    }
    setOauthApps((current) => [created, ...current])
  }, [])

  const toggleWebhook = useCallback((id: string) => {
    setWebhooks((current) => current.map((item) => (item.id === id ? { ...item, enabled: !item.enabled } : item)))
  }, [])

  const replayDelivery = useCallback((id: string) => {
    const source = deliveries.find((item) => item.id === id)
    if (!source) return
    const replayed: WebhookDelivery = {
      ...source,
      id: createId('del'),
      status: 'success',
      attempt: source.attempt + 1,
      latencyMs: 90 + Math.floor(Math.random() * 80),
      responseCode: 200,
      deliveredAt: new Date().toISOString(),
    }
    setDeliveries((current) => [replayed, ...current])
    setSelectedDeliveryId(replayed.id)
  }, [deliveries])

  const runPlayground = useCallback(
    (input: { method: string; path: string; body: string }) => {
      const ok = input.method !== 'DELETE'
      const status = ok ? (input.method === 'POST' ? 201 : 200) : 204
      const latencyMs = 80 + Math.floor(Math.random() * 120)
      pushRequestHistory({ method: input.method, path: input.path, status, latencyMs })
      return JSON.stringify(
        {
          ok,
          mock: true,
          version: apiVersion,
          method: input.method,
          path: input.path,
          status,
          latencyMs,
          rateLimitRemaining: API_HEALTH.rateLimitRemaining - 1,
          body: input.method === 'GET' ? undefined : safeParse(input.body),
          data: { message: 'Mock response from RegIntel API Explorer' },
        },
        null,
        2,
      )
    },
    [apiVersion, pushRequestHistory],
  )

  const value = useMemo<DeveloperContextValue>(
    () => ({
      health: API_HEALTH,
      metrics: PORTAL_METRICS,
      apiKeys,
      oauthApps,
      webhooks,
      deliveries,
      endpoints: API_ENDPOINTS,
      categories: API_CATEGORIES,
      webhookEvents: WEBHOOK_EVENT_TYPES,
      requestHistory,
      sdkPackages: SDK_PACKAGES,
      cliCommands: CLI_COMMANDS,
      sampleProjects: SAMPLE_PROJECTS,
      changelog: API_CHANGELOG,
      openApiPaths: OPENAPI_PATHS,
      openApiDocument: JSON.stringify(OPENAPI_MOCK, null, 2),
      apiVersion,
      setApiVersion,
      createApiKey,
      rotateApiKey,
      revokeApiKey,
      createOAuthApp,
      toggleWebhook,
      replayDelivery,
      runPlayground,
      pushRequestHistory,
      selectedEndpointId,
      selectEndpoint: setSelectedEndpointId,
      selectedWebhookId,
      selectWebhook: setSelectedWebhookId,
      selectedDeliveryId,
      selectDelivery: setSelectedDeliveryId,
    }),
    [
      apiKeys,
      apiVersion,
      createApiKey,
      createOAuthApp,
      deliveries,
      oauthApps,
      pushRequestHistory,
      replayDelivery,
      requestHistory,
      revokeApiKey,
      rotateApiKey,
      runPlayground,
      selectedDeliveryId,
      selectedEndpointId,
      selectedWebhookId,
      toggleWebhook,
      webhooks,
    ],
  )

  return <DeveloperContext.Provider value={value}>{children}</DeveloperContext.Provider>
}

function safeParse(value: string): unknown {
  try {
    return JSON.parse(value) as unknown
  } catch {
    return value
  }
}
