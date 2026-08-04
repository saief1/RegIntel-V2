import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Request } from 'express';
import { AuditService } from '../../common/audit/audit.service';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreatePermissionGrantDto } from './dto/permission-grant.dto';
import { PermissionsService } from './permissions.service';

@Injectable()
export class PermissionsAdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly permissionsService: PermissionsService,
    private readonly auditService: AuditService,
  ) {}

  async getMyEffective(userId: string, organizationId: string) {
    const roleInfo = await this.permissionsService.getMembershipRole(
      userId,
      organizationId,
    );
    const permissions = await this.permissionsService.getEffectivePermissions({
      userId,
      organizationId,
    });
    return {
      userId,
      organizationId,
      appRole: roleInfo?.appRole ?? null,
      isSuperAdmin: roleInfo?.isSuperAdmin ?? false,
      permissions,
    };
  }

  async check(
    userId: string,
    organizationId: string,
    permission: string,
    resourceType?: string,
    resourceId?: string,
  ) {
    const allowed = await this.permissionsService.hasPermission(
      {
        userId,
        organizationId,
        resourceType,
        resourceId,
      },
      permission,
    );
    return { permission, allowed };
  }

  async createGrant(
    organizationId: string,
    actorUserId: string,
    dto: CreatePermissionGrantDto,
    req: Request,
  ) {
    if (!dto.userId && !dto.roleKey) {
      throw new BadRequestException({
        code: 'PERMISSION_GRANT_SUBJECT_REQUIRED',
        message: 'Provide userId and/or roleKey for the grant subject.',
      });
    }
    if (dto.scope !== 'ORGANIZATION' && !dto.scopeId) {
      throw new BadRequestException({
        code: 'PERMISSION_GRANT_SCOPE_ID_REQUIRED',
        message: 'scopeId is required for TEAM and RESOURCE grants.',
      });
    }
    if (dto.scope === 'RESOURCE' && !dto.resourceType) {
      throw new BadRequestException({
        code: 'PERMISSION_GRANT_RESOURCE_TYPE_REQUIRED',
        message: 'resourceType is required for RESOURCE grants.',
      });
    }

    const permission = await this.prisma.permission.findUnique({
      where: { key: dto.permissionKey },
    });
    if (!permission) {
      throw new NotFoundException({
        code: 'PERMISSION_NOT_FOUND',
        message: `Unknown permission key: ${dto.permissionKey}`,
      });
    }

    const grant = await this.prisma.permissionGrant.create({
      data: {
        organizationId,
        permissionId: permission.id,
        scope: dto.scope,
        scopeId: dto.scopeId ?? null,
        resourceType: dto.resourceType ?? null,
        userId: dto.userId ?? null,
        roleKey: dto.roleKey ?? null,
        effect: dto.effect ?? 'ALLOW',
      },
      include: { permission: true },
    });

    await this.auditService.record({
      action: 'permissions.grant_created',
      resource: `permission_grant:${grant.id}`,
      userId: actorUserId,
      organizationId,
      request: req,
      after: {
        permissionKey: permission.key,
        scope: grant.scope,
        effect: grant.effect,
      },
    });

    return {
      id: grant.id,
      permissionKey: grant.permission.key,
      scope: grant.scope,
      scopeId: grant.scopeId,
      resourceType: grant.resourceType,
      userId: grant.userId,
      roleKey: grant.roleKey,
      effect: grant.effect,
    };
  }

  async deleteGrant(
    organizationId: string,
    grantId: string,
    actorUserId: string,
    req: Request,
  ) {
    const existing = await this.prisma.permissionGrant.findFirst({
      where: { id: grantId, organizationId },
    });
    if (!existing) {
      throw new NotFoundException({
        code: 'PERMISSION_GRANT_NOT_FOUND',
        message: 'Permission grant not found.',
      });
    }
    await this.prisma.permissionGrant.delete({ where: { id: grantId } });
    await this.auditService.record({
      action: 'permissions.grant_deleted',
      resource: `permission_grant:${grantId}`,
      userId: actorUserId,
      organizationId,
      request: req,
    });
    return { deleted: true };
  }

  async listGrants(organizationId: string) {
    const grants = await this.prisma.permissionGrant.findMany({
      where: { organizationId },
      include: { permission: true },
      orderBy: { createdAt: 'desc' },
    });
    return grants.map((grant) => ({
      id: grant.id,
      permissionKey: grant.permission.key,
      scope: grant.scope,
      scopeId: grant.scopeId,
      resourceType: grant.resourceType,
      userId: grant.userId,
      roleKey: grant.roleKey,
      effect: grant.effect,
    }));
  }
}
