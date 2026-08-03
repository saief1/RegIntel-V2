import { ENTERPRISE_ROLES, ROLE_ASSIGNMENTS } from '../data/governance/org'
import type { EnterpriseRoleId, Permission } from '../types/governance'

export function getRoleForUser(userId: string): EnterpriseRoleId {
  return ROLE_ASSIGNMENTS.find((item) => item.userId === userId)?.roleId ?? 'read_only'
}

export function getPermissionsForUser(userId: string): Permission[] {
  const roleId = getRoleForUser(userId)
  return ENTERPRISE_ROLES.find((role) => role.id === roleId)?.permissions ?? ['view']
}

export function can(userId: string, permission: Permission): boolean {
  return getPermissionsForUser(userId).includes(permission)
}
