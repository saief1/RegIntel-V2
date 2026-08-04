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
