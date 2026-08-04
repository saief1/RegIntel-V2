import { featureFlags } from '../config/featureFlags'
import { ENTERPRISE_ROLES, ROLE_ASSIGNMENTS } from '../data/governance/org'
import type { EnterpriseRoleId, Permission } from '../types/governance'

/**
 * Frontend RBAC helpers.
 * Default: mock governance matrix.
 * When VITE_USE_REAL_RBAC=true, callers should prefer API effective permissions
 * (`/permissions/me`) — these helpers remain as a safe mock fallback.
 */
export function getRoleForUser(userId: string): EnterpriseRoleId {
  return ROLE_ASSIGNMENTS.find((item) => item.userId === userId)?.roleId ?? 'read_only'
}

export function getPermissionsForUser(userId: string): Permission[] {
  const roleId = getRoleForUser(userId)
  return ENTERPRISE_ROLES.find((role) => role.id === roleId)?.permissions ?? ['view']
}

export function can(userId: string, permission: Permission): boolean {
  if (featureFlags.useRealRbac && featureFlags.useRealAuth) {
    // Effective checks go through /permissions/check once AuthSessionProvider has a token.
    // Fall back to mock matrix so shell navigation stays usable before session hydrate.
    return getPermissionsForUser(userId).includes(permission)
  }
  return getPermissionsForUser(userId).includes(permission)
}

export function isRealRbacEnabled(): boolean {
  return featureFlags.useRealRbac
}
