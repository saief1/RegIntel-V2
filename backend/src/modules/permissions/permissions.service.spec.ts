import { PermissionEffect, PermissionScope } from '@prisma/client';
import { PermissionsService } from './permissions.service';

describe('PermissionsService', () => {
  const prisma = {
    user: { findUnique: jest.fn() },
    organizationMembership: { findFirst: jest.fn() },
    permission: { findMany: jest.fn() },
    role: { findUnique: jest.fn() },
    teamMembership: { findMany: jest.fn() },
    permissionGrant: { findMany: jest.fn() },
  };

  const service = new PermissionsService(prisma as never);

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('returns empty permissions when membership is missing', async () => {
    prisma.user.findUnique.mockResolvedValue({
      isSuperAdmin: false,
      active: true,
    });
    prisma.organizationMembership.findFirst.mockResolvedValue(null);
    await expect(
      service.getEffectivePermissions({
        userId: 'u1',
        organizationId: 'o1',
      }),
    ).resolves.toEqual([]);
  });

  it('applies DENY grants over role ALLOWs', async () => {
    prisma.user.findUnique.mockResolvedValue({
      isSuperAdmin: false,
      active: true,
    });
    prisma.organizationMembership.findFirst.mockResolvedValue({
      appRole: 'ANALYST',
    });
    prisma.role.findUnique.mockResolvedValue({
      permissions: [
        { permission: { key: 'cases:read' } },
        { permission: { key: 'cases:write' } },
      ],
    });
    prisma.teamMembership.findMany.mockResolvedValue([]);
    prisma.permissionGrant.findMany.mockResolvedValue([
      {
        scope: PermissionScope.ORGANIZATION,
        scopeId: null,
        resourceType: null,
        effect: PermissionEffect.DENY,
        permission: { key: 'cases:write' },
      },
    ]);

    const effective = await service.getEffectivePermissions({
      userId: 'u1',
      organizationId: 'o1',
    });
    expect(effective).toContain('cases:read');
    expect(effective).not.toContain('cases:write');
  });

  it('grants all DB permissions to super admins', async () => {
    prisma.user.findUnique.mockResolvedValue({
      isSuperAdmin: true,
      active: true,
    });
    prisma.permission.findMany.mockResolvedValue([
      { key: 'org:manage' },
      { key: 'sso:manage' },
    ]);
    prisma.teamMembership.findMany.mockResolvedValue([]);
    prisma.permissionGrant.findMany.mockResolvedValue([]);

    await expect(
      service.getEffectivePermissions({
        userId: 'u1',
        organizationId: 'o1',
      }),
    ).resolves.toEqual(['org:manage', 'sso:manage']);
  });
});
