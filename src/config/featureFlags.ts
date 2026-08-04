/**
 * Feature flags for mock → real API cutover.
 * Vite exposes only VITE_* env vars. Defaults are false until a domain is ready.
 */
function readFlag(name: string): boolean {
  const value = (import.meta.env as Record<string, string | undefined>)[name]
  return value === 'true'
}

export const featureFlags = {
  useRealAuth: readFlag('VITE_USE_REAL_AUTH'),
  useRealRbac: readFlag('VITE_USE_REAL_RBAC'),
  useRealMfa: readFlag('VITE_USE_REAL_MFA'),
  useRealSso: readFlag('VITE_USE_REAL_SSO'),
  useRealScim: readFlag('VITE_USE_REAL_SCIM'),
  useRealKnowledge: readFlag('VITE_USE_REAL_KNOWLEDGE'),
  useRealTasks: readFlag('VITE_USE_REAL_TASKS'),
  useRealReports: readFlag('VITE_USE_REAL_REPORTS'),
  useRealPolicies: readFlag('VITE_USE_REAL_POLICIES'),
  useRealNotifications: readFlag('VITE_USE_REAL_NOTIFICATIONS'),
  useRealCases: readFlag('VITE_USE_REAL_CASES'),
  apiBaseUrl:
    (import.meta.env.VITE_API_BASE_URL as string | undefined) ??
    'http://localhost:3000/api/v1',
} as const

export type FeatureFlags = typeof featureFlags
