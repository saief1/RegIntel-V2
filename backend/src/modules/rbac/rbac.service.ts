import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AppRole } from '@prisma/client';
import { Request } from 'express';
import { AuditService } from '../../common/audit/audit.service';
import { PrismaService } from '../../common/prisma/prisma.service';
import { PermissionsService } from '../permissions/permissions.service';
import {
  ROLE_DEFINITIONS,
  ROLE_PERMISSION_MATRIX,
  appRoleToLegacyRole,
} from './rbac.constants';

@Injectable()
export class RbacService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly permissionsService: PermissionsService,
    private readonly auditService: AuditService,
  ) {}

  async listRoles() {
    const roles = await this.prisma.role.findMany({
      orderBy: { name: 'asc' },
      include: {
        permissions: { include: { permission: true } },
      },
    });
    if (roles.length === 0) {
      return ROLE_DEFINITIONS.map((role) => ({
        key: role.key,
        name: role.name,
        description: role.description,
        isSystem: true,
        permissions: [...ROLE_PERMISSION_MATRIX[role.key]],
      }));
    }
    return roles.map((role) => ({
      key: role.key,
      name: role.name,
      description: role.description,
      isSystem: role.isSystem,
      permissions: role.permissions.map((rp) => rp.permission.key).sort(),
    }));
  }

  async listPermissions() {
    const rows = await this.prisma.permission.findMany({
      orderBy: [{ category: 'asc' }, { key: 'asc' }],
    });
    return rows.map((row) => ({
      key: row.key,
      name: row.name,
      description: row.description,
      category: row.category,
    }));
  }

  /** Documented permission matrix for OpenAPI / ops. */
  async getPermissionMatrix() {
    const roles = await this.listRoles();
    const permissions = await this.listPermissions();
    return {
      roles,
      permissions,
      matrix: Object.fromEntries(
        roles.map((role) => [role.key, role.permissions]),
      ),
    };
  }

  async assignMemberRole(params: {
    actorUserId: string;
    organizationId: string;
    targetUserId: string;
    appRole: AppRole;
    req: Request;
  }) {
    if (params.appRole === 'SUPER_ADMIN') {
      throw new BadRequestException({
        code: 'RBAC_SUPER_ADMIN_VIA_MEMBERSHIP',
        message:
          'SUPER_ADMIN is a platform flag; assign via seed/ops, not membership role.',
      });
    }

    const canManage = await this.permissionsService.hasPermission(
      {
        userId: params.actorUserId,
        organizationId: params.organizationId,
      },
      'roles:manage',
    );
    if (!canManage) {
      throw new ForbiddenException({
        code: 'PERMISSION_DENIED',
        message: 'Missing required permission(s): roles:manage',
      });
    }

    const membership = await this.prisma.organizationMembership.findUnique({
      where: {
        userId_organizationId: {
          userId: params.targetUserId,
          organizationId: params.organizationId,
        },
      },
    });
    if (!membership) {
      throw new NotFoundException({
        code: 'MEMBERSHIP_NOT_FOUND',
        message: 'Membership not found for user in this organization.',
      });
    }

    const updated = await this.prisma.organizationMembership.update({
      where: { id: membership.id },
      data: {
        appRole: params.appRole,
        role: appRoleToLegacyRole(params.appRole),
      },
    });

    await this.auditService.record({
      action: 'rbac.role_assigned',
      resource: `user:${params.targetUserId}`,
      userId: params.actorUserId,
      organizationId: params.organizationId,
      request: params.req,
      after: { appRole: params.appRole },
    });

    return {
      userId: updated.userId,
      organizationId: updated.organizationId,
      appRole: updated.appRole,
      role: updated.role,
    };
  }
}
