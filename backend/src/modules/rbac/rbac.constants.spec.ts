import {
  ROLE_PERMISSION_MATRIX,
  appRoleToLegacyRole,
  legacyRoleToAppRole,
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
});
