import { featureFlags } from '../config/featureFlags'

export type ApiErrorBody = {
  success: false
  error: {
    code: string
    message: string
    requestId: string
    timestamp: string
    details?: Array<{ field: string; message: string }>
  }
}

export type ApiSuccessBody<T> = {
  success: true
  data: T
  meta?: {
    page: number
    pageSize: number
    total: number
  }
}

export class ApiClientError extends Error {
  readonly code: string
  readonly requestId: string
  readonly status: number

  constructor(status: number, body: ApiErrorBody) {
    super(body.error.message)
    this.name = 'ApiClientError'
    this.status = status
    this.code = body.error.code
    this.requestId = body.error.requestId
  }
}

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE'
  body?: unknown
  accessToken?: string | null
  organizationId?: string | null
}

/**
 * Minimal API client stub for real-backend cutover.
 * Used when VITE_USE_REAL_* flags are enabled; UI remains mock-default.
 */
export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const headers: Record<string, string> = {
    Accept: 'application/json',
  }
  if (options.body !== undefined) {
    headers['Content-Type'] = 'application/json'
  }
  if (options.accessToken) {
    headers.Authorization = `Bearer ${options.accessToken}`
  }
  if (options.organizationId) {
    headers['X-Organization-Id'] = options.organizationId
  }

  const response = await fetch(`${featureFlags.apiBaseUrl}${path}`, {
    method: options.method ?? 'GET',
    headers,
    credentials: 'include',
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  })

  if (response.status === 204) {
    return undefined as T
  }

  const json = (await response.json()) as ApiSuccessBody<T> | ApiErrorBody
  if (!response.ok || json.success === false) {
    throw new ApiClientError(response.status, json as ApiErrorBody)
  }
  return json.data
}

export type AuthLoginResult = {
  accessToken: string
  expiresIn: string
  user: {
    id: string
    email: string
    name: string
    mfaEnabled: boolean
    organizations: Array<{
      id: string
      name: string
      slug: string
      role: string
    }>
  }
}

export type AuthLoginOrMfaResult =
  | AuthLoginResult
  | { mfaRequired: true; mfaChallengeToken: string }

/** Real auth API helpers — only called when featureFlags.useRealAuth is true. */
export const realAuthApi = {
  login(email: string, password: string) {
    return apiRequest<AuthLoginOrMfaResult>('/auth/login', {
      method: 'POST',
      body: { email, password },
    })
  },
  verifyMfa(
    mfaChallengeToken: string,
    code: string,
    options?: { rememberBrowser?: boolean; deviceName?: string },
  ) {
    return apiRequest<AuthLoginResult>('/auth/mfa/verify', {
      method: 'POST',
      body: {
        mfaChallengeToken,
        code,
        rememberBrowser: options?.rememberBrowser,
        deviceName: options?.deviceName,
      },
    })
  },
  refresh() {
    return apiRequest<AuthLoginResult>('/auth/refresh', { method: 'POST' })
  },
  logout() {
    return apiRequest<void>('/auth/logout', { method: 'POST' })
  },
  me(accessToken: string) {
    return apiRequest<AuthLoginResult['user']>('/users/me', { accessToken })
  },
}

export type RealSession = {
  id: string
  familyId: string
  device: string
  browser: string
  ipAddress: string | null
  lastActiveAt: string
  current: boolean
  userId: string
}

export type RealTrustedDevice = {
  id: string
  name: string
  lastSeenAt: string
  trusted: boolean
  userAgent: string | null
}

export type RealLoginHistoryItem = {
  id: string
  userId: string | null
  at: string
  ip: string | null
  location: string
  result: string
}

/** Session + Security Center APIs — gated by VITE_USE_REAL_AUTH. */
export const realSecurityApi = {
  listSessions(accessToken: string) {
    return apiRequest<RealSession[]>('/sessions', { accessToken })
  },
  revokeSession(accessToken: string, sessionId: string) {
    return apiRequest<void>(`/sessions/${sessionId}`, {
      method: 'DELETE',
      accessToken,
    })
  },
  logoutEverywhere(accessToken: string) {
    return apiRequest<{ revoked: number }>('/sessions/logout-everywhere', {
      method: 'POST',
      accessToken,
    })
  },
  sessionPolicy(accessToken: string) {
    return apiRequest<{ idleTimeoutSeconds: number }>('/sessions/policy', {
      accessToken,
    })
  },
  listDevices(accessToken: string) {
    return apiRequest<RealTrustedDevice[]>('/security/devices', { accessToken })
  },
  revokeDevice(accessToken: string, deviceId: string) {
    return apiRequest<void>(`/security/devices/${deviceId}`, {
      method: 'DELETE',
      accessToken,
    })
  },
  loginHistory(accessToken: string) {
    return apiRequest<RealLoginHistoryItem[]>('/security/login-history', {
      accessToken,
    })
  },
  securityEvents(accessToken: string) {
    return apiRequest<
      Array<{
        id: string
        action: string
        severity: string
        detail: string | null
        createdAt: string
      }>
    >('/security/events', { accessToken })
  },
  auditTrail(accessToken: string, organizationId?: string | null) {
    return apiRequest<
      Array<{
        id: string
        action: string
        resource: string
        severity: string
        createdAt: string
      }>
    >('/security/audit-trail', { accessToken, organizationId })
  },
}

/** Real RBAC helpers — gated by VITE_USE_REAL_RBAC. */
export const realRbacApi = {
  matrix(accessToken: string) {
    return apiRequest<{
      roles: Array<{ key: string; permissions: string[] }>
      matrix: Record<string, string[]>
    }>('/rbac/matrix', { accessToken })
  },
  effectivePermissions(accessToken: string, organizationId: string) {
    return apiRequest<{
      permissions: string[]
      appRole: string | null
      isSuperAdmin: boolean
    }>('/permissions/me', { accessToken, organizationId })
  },
  check(accessToken: string, organizationId: string, permission: string) {
    return apiRequest<{ permission: string; allowed: boolean }>(
      `/permissions/check?permission=${encodeURIComponent(permission)}`,
      { accessToken, organizationId },
    )
  },
}

/** Real SSO helpers — gated by VITE_USE_REAL_SSO. */
export const realSsoApi = {
  listConfigurations(accessToken: string, organizationId: string) {
    return apiRequest<
      Array<{
        id: string
        name: string
        providerType: string
        enabled: boolean
      }>
    >('/sso/configurations', { accessToken, organizationId })
  },
}

export type RealNotification = {
  id: string
  kind: string
  title: string
  body: string
  href?: string | null
  groupLabel?: string | null
  caseId?: string | null
  taskId?: string | null
  readAt?: string | null
  archivedAt?: string | null
  createdAt: string
}

export type RealAuditLog = {
  id: string
  action: string
  resource: string
  category?: string
  userId?: string | null
  requestId?: string | null
  correlationId?: string | null
  createdAt: string
  entryHash?: string
}

/** Real immutable audit APIs — gated by VITE_USE_REAL_AUDIT. */
export const realAuditApi = {
  list(accessToken: string, organizationId: string, page = 1, pageSize = 20) {
    return apiRequest<RealAuditLog[]>(
      `/audit-entries/logs?page=${page}&pageSize=${pageSize}`,
      { accessToken, organizationId },
    )
  },
  retention(accessToken: string, organizationId: string) {
    return apiRequest<{
      retentionDays: number
      immutable: boolean
      store: string
    }>('/audit-entries/retention', { accessToken, organizationId })
  },
}

/** Real search APIs — gated by VITE_USE_REAL_SEARCH. */
export const realSearchApi = {
  query(
    accessToken: string,
    organizationId: string,
    q: string,
    page = 1,
    pageSize = 20,
  ) {
    const params = new URLSearchParams({
      q,
      page: String(page),
      pageSize: String(pageSize),
    })
    return apiRequest<
      Array<{
        id: string
        entityType: string
        entityId: string
        title: string
        rank: number
        highlights: { title?: string; body?: string }
      }>
    >(`/search?${params.toString()}`, { accessToken, organizationId })
  },
}

/** Real AI gateway APIs — gated by VITE_USE_REAL_AI. */
export type RealAiMessage = {
  id: string
  role: 'SYSTEM' | 'USER' | 'ASSISTANT' | 'TOOL'
  content: string
  createdAt: string
  model?: string | null
  confidence?: number
}

export type RealAiConversation = {
  id: string
  title: string
  mode: string
  isPinned: boolean
  isFavorite: boolean
  isSaved: boolean
  createdAt: string
  updatedAt: string
  messages?: RealAiMessage[]
}

export type RealAiChatResult = {
  conversationId: string
  message: RealAiMessage
  provider: string
  model: string
  usage: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
  costUsd: number
  latencyMs: number
}

export const realAiApi = {
  listConversations(accessToken: string, organizationId: string) {
    return apiRequest<RealAiConversation[]>('/ai/conversations', {
      accessToken,
      organizationId,
    })
  },
  getConversation(accessToken: string, organizationId: string, id: string) {
    return apiRequest<RealAiConversation & { messages: RealAiMessage[] }>(
      `/ai/conversations/${id}`,
      { accessToken, organizationId },
    )
  },
  createConversation(
    accessToken: string,
    organizationId: string,
    body?: { title?: string; mode?: string },
  ) {
    return apiRequest<RealAiConversation>('/ai/conversations', {
      method: 'POST',
      accessToken,
      organizationId,
      body: body ?? {},
    })
  },
  deleteConversation(accessToken: string, organizationId: string, id: string) {
    return apiRequest<{ deleted: boolean }>(`/ai/conversations/${id}`, {
      method: 'DELETE',
      accessToken,
      organizationId,
    })
  },
  chat(
    accessToken: string,
    organizationId: string,
    body: {
      message: string
      conversationId?: string
      mode?: string
      title?: string
      context?: Record<string, string>
    },
  ) {
    return apiRequest<RealAiChatResult>('/ai/chat', {
      method: 'POST',
      accessToken,
      organizationId,
      body,
    })
  },
  health(accessToken: string, organizationId: string) {
    return apiRequest<{
      status: string
      provider: { provider: string; status: string }
    }>('/ai/health', { accessToken, organizationId })
  },
}

/** Real notification APIs — gated by VITE_USE_REAL_NOTIFICATIONS. */
export const realNotificationsApi = {
  list(accessToken: string, organizationId: string) {
    return apiRequest<RealNotification[]>('/notifications', {
      accessToken,
      organizationId,
    })
  },
  markRead(accessToken: string, organizationId: string, ids: string[]) {
    return apiRequest<{ updated: number }>('/notifications/read', {
      method: 'POST',
      accessToken,
      organizationId,
      body: { ids },
    })
  },
  markAllRead(accessToken: string, organizationId: string) {
    return apiRequest<{ updated: number }>('/notifications/read-all', {
      method: 'POST',
      accessToken,
      organizationId,
    })
  },
  archive(accessToken: string, organizationId: string, ids: string[]) {
    return apiRequest<{ archived: number }>('/notifications/archive', {
      method: 'POST',
      accessToken,
      organizationId,
      body: { ids },
    })
  },
  getPreferences(accessToken: string, organizationId: string) {
    return apiRequest<{
      inAppEnabled: boolean
      emailEnabled: boolean
      digestEnabled: boolean
      digestHourUtc: number
      kindsMuted: string[]
    }>('/notifications/preferences', { accessToken, organizationId })
  },
}
