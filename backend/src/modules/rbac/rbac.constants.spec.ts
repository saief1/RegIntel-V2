import {
  ROLE_PERMISSION_MATRIX,
  appRoleToLegacyRole,
  legacyRoleToAppRole,
  resolveRoleAlias,
} from './rbac.constants';

describe('rbac.constants', () => {
  it('maps legacy membership roles to AppRole', () => {
    expect(legacyRoleToAppRole('OWNER')).toBe('ORG_ADMIN');
    expect(legacyRoleToAppRole('ADMIN')).toBe('ORG_ADMIN');
    expect(legacyRoleToAppRole('MEMBER')).toBe('ANALYST');
  });

  it('maps AppRole back to legacy labels', () => {
    expect(appRoleToLegacyRole('ORG_ADMIN')).toBe('OWNER');
    expect(appRoleToLegacyRole('MANAGER')).toBe('ADMIN');
    expect(appRoleToLegacyRole('VIEWER')).toBe('MEMBER');
    expect(appRoleToLegacyRole('GUEST')).toBe('MEMBER');
  });

  it('resolves enterprise role aliases', () => {
    expect(resolveRoleAlias('Owner')).toBe('ORG_ADMIN');
    expect(resolveRoleAlias('Administrator')).toBe('ORG_ADMIN');
    expect(resolveRoleAlias('Reviewer')).toBe('REVIEWER');
    expect(resolveRoleAlias('Employee')).toBe('EMPLOYEE');
    expect(resolveRoleAlias('Guest')).toBe('GUEST');
  });

  it('gives viewers a read-only subset of analyst permissions', () => {
    const viewer = new Set(ROLE_PERMISSION_MATRIX.VIEWER);
    const analyst = new Set(ROLE_PERMISSION_MATRIX.ANALYST);
    for (const key of viewer) {
      expect(analyst.has(key)).toBe(true);
    }
    expect(viewer.has('cases:write')).toBe(false);
    expect(analyst.has('cases:write')).toBe(true);
  });

  it('gives org admins full catalog access', () => {
    expect(ROLE_PERMISSION_MATRIX.ORG_ADMIN).toEqual(
      ROLE_PERMISSION_MATRIX.SUPER_ADMIN,
    );
    expect(ROLE_PERMISSION_MATRIX.ORG_ADMIN).toContain('sso:manage');
    expect(ROLE_PERMISSION_MATRIX.ORG_ADMIN).toContain('scim:manage');
  });

  it('keeps guest minimal relative to employee', () => {
    const guest = new Set(ROLE_PERMISSION_MATRIX.GUEST);
    const employee = new Set(ROLE_PERMISSION_MATRIX.EMPLOYEE);
    for (const key of guest) {
      expect(employee.has(key)).toBe(true);
    }
    expect(guest.has('tasks:write')).toBe(false);
  });
});
