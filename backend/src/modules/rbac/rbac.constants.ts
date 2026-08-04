import { AppRole } from '@prisma/client';

export type PermissionDefinition = {
  key: string;
  name: string;
  description: string;
  category: string;
};

/**
 * Canonical permission catalog (database-seeded).
 * Keys use `resource:action` form for stable API/guard checks.
 */
export const PERMISSION_CATALOG: PermissionDefinition[] = [
  {
    key: 'org:read',
    name: 'Read organization',
    description: 'View organization profile and membership.',
    category: 'organization',
  },
  {
    key: 'org:manage',
    name: 'Manage organization',
    description: 'Update organization settings and membership.',
    category: 'organization',
  },
  {
    key: 'users:read',
    name: 'Read users',
    description: 'List and view users in the organization.',
    category: 'users',
  },
  {
    key: 'users:manage',
    name: 'Manage users',
    description: 'Create, update, disable users and assign roles.',
    category: 'users',
  },
  {
    key: 'roles:read',
    name: 'Read roles',
    description: 'View roles and permission matrix.',
    category: 'rbac',
  },
  {
    key: 'roles:manage',
    name: 'Manage roles',
    description: 'Assign roles and manage permission grants.',
    category: 'rbac',
  },
  {
    key: 'security:read',
    name: 'Read security',
    description: 'View MFA/SSO/SCIM security configuration.',
    category: 'security',
  },
  {
    key: 'security:manage',
    name: 'Manage security',
    description: 'Configure MFA policy, SSO, and SCIM.',
    category: 'security',
  },
  {
    key: 'cases:read',
    name: 'Read cases',
    description: 'View compliance cases.',
    category: 'cases',
  },
  {
    key: 'cases:write',
    name: 'Write cases',
    description: 'Create and update cases.',
    category: 'cases',
  },
  {
    key: 'policies:read',
    name: 'Read policies',
    description: 'View policies.',
    category: 'policies',
  },
  {
    key: 'policies:write',
    name: 'Write policies',
    description: 'Create and edit policies.',
    category: 'policies',
  },
  {
    key: 'policies:approve',
    name: 'Approve policies',
    description: 'Approve and publish policies.',
    category: 'policies',
  },
  {
    key: 'tasks:read',
    name: 'Read tasks',
    description: 'View work tasks.',
    category: 'tasks',
  },
  {
    key: 'tasks:write',
    name: 'Write tasks',
    description: 'Create and update tasks.',
    category: 'tasks',
  },
  {
    key: 'reports:read',
    name: 'Read reports',
    description: 'View reports and analytics.',
    category: 'reports',
  },
  {
    key: 'reports:export',
    name: 'Export reports',
    description: 'Export report packages.',
    category: 'reports',
  },
  {
    key: 'audit:read',
    name: 'Read audit',
    description: 'View audit trail events.',
    category: 'audit',
  },
  {
    key: 'scim:manage',
    name: 'Manage SCIM',
    description: 'Configure and operate SCIM provisioning.',
    category: 'identity',
  },
  {
    key: 'sso:manage',
    name: 'Manage SSO',
    description: 'Configure enterprise SSO providers.',
    category: 'identity',
  },
];

/** Role → permission keys. SUPER_ADMIN inherits all via code path. */
export const ROLE_PERMISSION_MATRIX: Record<AppRole, readonly string[]> = {
  SUPER_ADMIN: PERMISSION_CATALOG.map((p) => p.key),
  ORG_ADMIN: PERMISSION_CATALOG.map((p) => p.key),
  COMPLIANCE_OFFICER: [
    'org:read',
    'users:read',
    'roles:read',
    'security:read',
    'cases:read',
    'cases:write',
    'policies:read',
    'policies:write',
    'policies:approve',
    'tasks:read',
    'tasks:write',
    'reports:read',
    'reports:export',
    'audit:read',
  ],
  MANAGER: [
    'org:read',
    'users:read',
    'roles:read',
    'cases:read',
    'cases:write',
    'policies:read',
    'tasks:read',
    'tasks:write',
    'reports:read',
    'reports:export',
  ],
  ANALYST: [
    'org:read',
    'users:read',
    'cases:read',
    'cases:write',
    'policies:read',
    'tasks:read',
    'tasks:write',
    'reports:read',
  ],
  REVIEWER: [
    'org:read',
    'users:read',
    'cases:read',
    'policies:read',
    'policies:approve',
    'tasks:read',
    'reports:read',
    'audit:read',
  ],
  EMPLOYEE: [
    'org:read',
    'cases:read',
    'policies:read',
    'tasks:read',
    'tasks:write',
  ],
  VIEWER: [
    'org:read',
    'users:read',
    'cases:read',
    'policies:read',
    'tasks:read',
    'reports:read',
  ],
  GUEST: ['org:read', 'policies:read', 'tasks:read'],
};

export const ROLE_DEFINITIONS: Array<{
  key: AppRole;
  name: string;
  description: string;
  /** Human-facing aliases aligned to enterprise naming (Owner, Guest, …). */
  aliases: string[];
}> = [
  {
    key: 'SUPER_ADMIN',
    name: 'Super Admin',
    description: 'Platform-wide administrator with all permissions.',
    aliases: ['Super Admin'],
  },
  {
    key: 'ORG_ADMIN',
    name: 'Administrator',
    description:
      'Full control within an organization (Owner when membership legacy OWNER).',
    aliases: ['Owner', 'Administrator', 'Organization Admin'],
  },
  {
    key: 'COMPLIANCE_OFFICER',
    name: 'Compliance Officer',
    description: 'Owns compliance cases, policies, and audit visibility.',
    aliases: ['Compliance Officer'],
  },
  {
    key: 'MANAGER',
    name: 'Manager',
    description: 'Manages team work, cases, and reporting.',
    aliases: ['Manager'],
  },
  {
    key: 'ANALYST',
    name: 'Analyst',
    description: 'Day-to-day case and task execution.',
    aliases: ['Analyst'],
  },
  {
    key: 'REVIEWER',
    name: 'Reviewer',
    description: 'Reviews and approves policies; read-heavy compliance access.',
    aliases: ['Reviewer'],
  },
  {
    key: 'EMPLOYEE',
    name: 'Employee',
    description: 'Standard workforce access to tasks and policy reading.',
    aliases: ['Employee'],
  },
  {
    key: 'VIEWER',
    name: 'Viewer',
    description: 'Read-only access across compliance surfaces.',
    aliases: ['Viewer'],
  },
  {
    key: 'GUEST',
    name: 'Guest',
    description: 'Minimal read access for external or temporary collaborators.',
    aliases: ['Guest'],
  },
];

/** Resolve alias or AppRole key → AppRole (case-insensitive). */
export function resolveRoleAlias(input: string): AppRole | null {
  const normalized = input
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, '_');
  const asKey = normalized.toUpperCase() as AppRole;
  if (asKey in ROLE_PERMISSION_MATRIX) {
    return asKey;
  }
  const aliasMap: Record<string, AppRole> = {
    owner: 'ORG_ADMIN',
    administrator: 'ORG_ADMIN',
    organization_admin: 'ORG_ADMIN',
    org_admin: 'ORG_ADMIN',
    compliance_officer: 'COMPLIANCE_OFFICER',
    manager: 'MANAGER',
    analyst: 'ANALYST',
    reviewer: 'REVIEWER',
    employee: 'EMPLOYEE',
    viewer: 'VIEWER',
    guest: 'GUEST',
    super_admin: 'SUPER_ADMIN',
  };
  return aliasMap[normalized] ?? null;
}

export function legacyRoleToAppRole(
  role: 'OWNER' | 'ADMIN' | 'MEMBER',
): AppRole {
  switch (role) {
    case 'OWNER':
    case 'ADMIN':
      return 'ORG_ADMIN';
    case 'MEMBER':
    default:
      return 'ANALYST';
  }
}

export function appRoleToLegacyRole(
  role: AppRole,
): 'OWNER' | 'ADMIN' | 'MEMBER' {
  switch (role) {
    case 'SUPER_ADMIN':
    case 'ORG_ADMIN':
      return 'OWNER';
    case 'COMPLIANCE_OFFICER':
    case 'MANAGER':
      return 'ADMIN';
    default:
      return 'MEMBER';
  }
}
