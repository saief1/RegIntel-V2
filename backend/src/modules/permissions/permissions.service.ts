import { Injectable } from '@nestjs/common';
import { AppRole, PermissionEffect, PermissionScope } from '@prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service';
import { ROLE_PERMISSION_MATRIX } from '../rbac/rbac.constants';

export type EffectivePermissionContext = {
  userId: string;
  organizationId: string;
  teamIds?: string[];
  resourceType?: string;
  resourceId?: string;
};

@Injectable()
export class PermissionsService {
  constructor(private readonly prisma: PrismaService) {}

  async getMembershipRole(
    userId: string,
    organizationId: string,
  ): Promise<{ appRole: AppRole; isSuperAdmin: boolean } | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { isSuperAdmin: true, active: true },
    });
    if (!user?.active) {
      return null;
    }
    if (user.isSuperAdmin) {
      return { appRole: 'SUPER_ADMIN', isSuperAdmin: true };
    }
    const membership = await this.prisma.organizationMembership.findFirst({
      where: { userId, organizationId, status: 'ACTIVE' },
      select: { appRole: true },
    });
    if (!membership) {
      return null;
    }
    return { appRole: membership.appRole, isSuperAdmin: false };
  }

  /**
   * Role permissions from DB (with matrix fallback), plus org/team/resource grants.
   * DENY grants win over ALLOW.
   */
  async getEffectivePermissions(
    ctx: EffectivePermissionContext,
  ): Promise<string[]> {
    const roleInfo = await this.getMembershipRole(
      ctx.userId,
      ctx.organizationId,
    );
    if (!roleInfo) {
      return [];
    }

    const allowed = new Set<string>();
    const denied = new Set<string>();

    if (roleInfo.isSuperAdmin || roleInfo.appRole === 'SUPER_ADMIN') {
      const all = await this.prisma.permission.findMany({
        select: { key: true },
      });
      for (const row of all) {
        allowed.add(row.key);
      }
      if (allowed.size === 0) {
        for (const key of ROLE_PERMISSION_MATRIX.SUPER_ADMIN) {
          allowed.add(key);
        }
      }
    } else {
      const role = await this.prisma.role.findUnique({
        where: { key: roleInfo.appRole },
        include: { permissions: { include: { permission: true } } },
      });
      if (role) {
        for (const rp of role.permissions) {
          allowed.add(rp.permission.key);
        }
      } else {
        for (const key of ROLE_PERMISSION_MATRIX[roleInfo.appRole]) {
          allowed.add(key);
        }
      }
    }

    const teamIds =
      ctx.teamIds ??
      (
        await this.prisma.teamMembership.findMany({
          where: {
            userId: ctx.userId,
            team: { organizationId: ctx.organizationId },
          },
          select: { teamId: true },
        })
      ).map((row) => row.teamId);

    const grants = await this.prisma.permissionGrant.findMany({
      where: {
        organizationId: ctx.organizationId,
        OR: [
          { userId: ctx.userId },
          { roleKey: roleInfo.appRole },
          ...(roleInfo.isSuperAdmin
            ? [{ roleKey: 'SUPER_ADMIN' as AppRole }]
            : []),
        ],
      },
      include: { permission: true },
    });

    for (const grant of grants) {
      if (!this.grantApplies(grant, ctx, teamIds)) {
        continue;
      }
      if (grant.effect === PermissionEffect.DENY) {
        denied.add(grant.permission.key);
      } else {
        allowed.add(grant.permission.key);
      }
    }

    for (const key of denied) {
      allowed.delete(key);
    }
    return [...allowed].sort();
  }

  async hasPermission(
    ctx: EffectivePermissionContext,
    permissionKey: string,
  ): Promise<boolean> {
    const effective = await this.getEffectivePermissions(ctx);
    return effective.includes(permissionKey);
  }

  async hasAllPermissions(
    ctx: EffectivePermissionContext,
    permissionKeys: string[],
  ): Promise<boolean> {
    if (permissionKeys.length === 0) {
      return true;
    }
    const effective = await this.getEffectivePermissions(ctx);
    return permissionKeys.every((key) => effective.includes(key));
  }

  private grantApplies(
    grant: {
      scope: PermissionScope;
      scopeId: string | null;
      resourceType: string | null;
    },
    ctx: EffectivePermissionContext,
    teamIds: string[],
  ): boolean {
    switch (grant.scope) {
      case PermissionScope.ORGANIZATION:
        return true;
      case PermissionScope.TEAM:
        return !!grant.scopeId && teamIds.includes(grant.scopeId);
      case PermissionScope.RESOURCE:
        if (!ctx.resourceType || !ctx.resourceId) {
          return false;
        }
        return (
          grant.resourceType === ctx.resourceType &&
          grant.scopeId === ctx.resourceId
        );
      default:
        return false;
    }
  }
}
