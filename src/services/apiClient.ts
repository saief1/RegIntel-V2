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
  verifyMfa(mfaChallengeToken: string, code: string) {
    return apiRequest<AuthLoginResult>('/auth/mfa/verify', {
      method: 'POST',
      body: { mfaChallengeToken, code },
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
