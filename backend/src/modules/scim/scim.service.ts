import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { AppRole } from '@prisma/client';
import { createHash, randomBytes } from 'crypto';
import { Request } from 'express';
import { AuditService } from '../../common/audit/audit.service';
import { PrismaService } from '../../common/prisma/prisma.service';
import { PasswordService } from '../auth/password.service';
import { appRoleToLegacyRole } from '../rbac/rbac.constants';
import {
  ScimConfigDto,
  ScimGroupDto,
  ScimMappingDto,
  ScimUserDto,
} from './dto/scim.dto';

@Injectable()
export class ScimService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly passwordService: PasswordService,
    private readonly auditService: AuditService,
  ) {}

  async getConfiguration(organizationId: string) {
    const row = await this.prisma.scimConfiguration.findUnique({
      where: { organizationId },
    });
    if (!row) {
      return {
        organizationId,
        enabled: false,
        bearerTokenConfigured: false,
        baseUrl: `/api/v1/scim/v2`,
      };
    }
    return {
      id: row.id,
      organizationId: row.organizationId,
      enabled: row.enabled,
      bearerTokenConfigured: !!row.bearerTokenHash,
      baseUrl: row.baseUrl ?? `/api/v1/scim/v2`,
    };
  }

  async upsertConfiguration(
    organizationId: string,
    actorUserId: string,
    dto: ScimConfigDto,
    req: Request,
  ) {
    const existing = await this.prisma.scimConfiguration.findUnique({
      where: { organizationId },
    });
    const bearerTokenHash =
      dto.bearerToken !== undefined
        ? this.hashToken(dto.bearerToken)
        : (existing?.bearerTokenHash ?? null);

    const row = existing
      ? await this.prisma.scimConfiguration.update({
          where: { organizationId },
          data: {
            enabled: dto.enabled ?? existing.enabled,
            bearerTokenHash,
            baseUrl: dto.baseUrl ?? existing.baseUrl,
          },
        })
      : await this.prisma.scimConfiguration.create({
          data: {
            organizationId,
            enabled: dto.enabled ?? false,
            bearerTokenHash,
            baseUrl: dto.baseUrl ?? '/api/v1/scim/v2',
          },
        });

    await this.auditService.record({
      action: 'scim.config_updated',
      resource: `scim_configuration:${row.id}`,
      userId: actorUserId,
      organizationId,
      request: req,
    });

    return this.getConfiguration(organizationId);
  }

  async assertScimBearer(organizationId: string, authorization?: string) {
    const config = await this.prisma.scimConfiguration.findUnique({
      where: { organizationId },
    });
    if (!config?.enabled || !config.bearerTokenHash) {
      throw new UnauthorizedException({
        code: 'SCIM_DISABLED',
        message: 'SCIM provisioning is not enabled for this organization.',
      });
    }
    if (!authorization?.startsWith('Bearer ')) {
      throw new UnauthorizedException({
        code: 'SCIM_UNAUTHORIZED',
        message: 'SCIM bearer token required.',
      });
    }
    const token = authorization.slice('Bearer '.length).trim();
    if (this.hashToken(token) !== config.bearerTokenHash) {
      throw new UnauthorizedException({
        code: 'SCIM_UNAUTHORIZED',
        message: 'SCIM bearer token is invalid.',
      });
    }
  }

  async listUsers(organizationId: string) {
    const memberships = await this.prisma.organizationMembership.findMany({
      where: { organizationId },
      include: { user: true },
      orderBy: { createdAt: 'asc' },
    });
    return {
      schemas: ['urn:ietf:params:scim:api:messages:2.0:ListResponse'],
      totalResults: memberships.length,
      Resources: memberships.map((m) => this.toScimUser(m.user, m.appRole)),
    };
  }

  async getUser(organizationId: string, userId: string) {
    const membership = await this.prisma.organizationMembership.findFirst({
      where: { organizationId, userId },
      include: { user: true },
    });
    if (!membership) {
      throw new NotFoundException({
        code: 'SCIM_USER_NOT_FOUND',
        message: 'SCIM user not found.',
      });
    }
    return this.toScimUser(membership.user, membership.appRole);
  }

  async provisionUser(
    organizationId: string,
    dto: ScimUserDto,
    actorUserId: string | null,
    req: Request,
  ) {
    const email = (
      dto.emails?.find((e) => e.primary)?.value ??
      dto.emails?.[0]?.value ??
      dto.userName
    ).toLowerCase();
    const name =
      dto.name?.formatted ??
      [dto.name?.givenName, dto.name?.familyName].filter(Boolean).join(' ') ??
      email.split('@')[0];
    const appRole: AppRole =
      dto.appRole && dto.appRole !== 'SUPER_ADMIN' ? dto.appRole : 'ANALYST';
    const externalId = dto.externalId ?? `scim:${email}`;

    const existing = await this.prisma.user.findFirst({
      where: {
        OR: [{ email }, { externalId }],
      },
    });

    let userId: string;
    let created = false;

    if (existing) {
      userId = existing.id;
      await this.prisma.user.update({
        where: { id: existing.id },
        data: {
          name,
          email,
          externalId,
          active: dto.active ?? true,
        },
      });
      await this.prisma.organizationMembership.upsert({
        where: {
          userId_organizationId: { userId, organizationId },
        },
        update: {
          status: dto.active === false ? 'DISABLED' : 'ACTIVE',
          appRole,
          role: appRoleToLegacyRole(appRole),
        },
        create: {
          userId,
          organizationId,
          status: dto.active === false ? 'DISABLED' : 'ACTIVE',
          appRole,
          role: appRoleToLegacyRole(appRole),
        },
      });
    } else {
      created = true;
      const passwordHash = await this.passwordService.hash(
        randomBytes(24).toString('base64url'),
      );
      const user = await this.prisma.user.create({
        data: {
          email,
          name,
          passwordHash,
          externalId,
          active: dto.active ?? true,
          memberships: {
            create: {
              organizationId,
              appRole,
              role: appRoleToLegacyRole(appRole),
              status: dto.active === false ? 'DISABLED' : 'ACTIVE',
            },
          },
        },
      });
      userId = user.id;
    }

    await this.auditService.record({
      action: created ? 'scim.user_created' : 'scim.user_updated',
      resource: `user:${userId}`,
      userId: actorUserId,
      organizationId,
      request: req,
    });

    return this.getUser(organizationId, userId);
  }

  async deprovisionUser(
    organizationId: string,
    userId: string,
    actorUserId: string | null,
    req: Request,
  ) {
    const membership = await this.prisma.organizationMembership.findFirst({
      where: { organizationId, userId },
    });
    if (!membership) {
      throw new NotFoundException({
        code: 'SCIM_USER_NOT_FOUND',
        message: 'SCIM user not found.',
      });
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.organizationMembership.update({
        where: { id: membership.id },
        data: { status: 'DISABLED' },
      });
      await tx.user.update({
        where: { id: userId },
        data: { active: false },
      });
      await tx.refreshToken.updateMany({
        where: { userId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
    });

    await this.auditService.record({
      action: 'scim.user_deprovisioned',
      resource: `user:${userId}`,
      userId: actorUserId,
      organizationId,
      request: req,
    });

    return { id: userId, active: false };
  }

  async listGroups(organizationId: string) {
    const groups = await this.prisma.scimGroup.findMany({
      where: { organizationId },
      orderBy: { displayName: 'asc' },
    });
    return {
      schemas: ['urn:ietf:params:scim:api:messages:2.0:ListResponse'],
      totalResults: groups.length,
      Resources: groups.map((g) => this.toScimGroup(g)),
    };
  }

  async upsertGroup(
    organizationId: string,
    dto: ScimGroupDto,
    actorUserId: string | null,
    req: Request,
  ) {
    const externalId =
      dto.externalId ?? `scim-group:${dto.displayName.toLowerCase()}`;
    const existing = await this.prisma.scimGroup.findUnique({
      where: {
        organizationId_externalId: { organizationId, externalId },
      },
    });

    const row = existing
      ? await this.prisma.scimGroup.update({
          where: { id: existing.id },
          data: {
            displayName: dto.displayName,
            memberExternalIds: dto.members ?? existing.memberExternalIds,
            mappedRole: dto.mappedRole ?? existing.mappedRole,
          },
        })
      : await this.prisma.scimGroup.create({
          data: {
            organizationId,
            externalId,
            displayName: dto.displayName,
            memberExternalIds: dto.members ?? [],
            mappedRole: dto.mappedRole ?? null,
          },
        });

    if (row.mappedRole && row.memberExternalIds.length > 0) {
      await this.applyGroupRoleMapping(organizationId, row);
    }

    await this.auditService.record({
      action: existing ? 'scim.group_updated' : 'scim.group_created',
      resource: `scim_group:${row.id}`,
      userId: actorUserId,
      organizationId,
      request: req,
    });

    return this.toScimGroup(row);
  }

  async deleteGroup(
    organizationId: string,
    groupId: string,
    actorUserId: string | null,
    req: Request,
  ) {
    const group = await this.prisma.scimGroup.findFirst({
      where: { id: groupId, organizationId },
    });
    if (!group) {
      throw new NotFoundException({
        code: 'SCIM_GROUP_NOT_FOUND',
        message: 'SCIM group not found.',
      });
    }
    await this.prisma.scimGroup.delete({ where: { id: groupId } });
    await this.auditService.record({
      action: 'scim.group_deleted',
      resource: `scim_group:${groupId}`,
      userId: actorUserId,
      organizationId,
      request: req,
    });
    return { deleted: true };
  }

  async getMappings(organizationId: string) {
    const groups = await this.prisma.scimGroup.findMany({
      where: { organizationId },
      orderBy: { displayName: 'asc' },
    });
    return groups.map((g) => ({
      scimGroupId: g.id,
      externalId: g.externalId,
      displayName: g.displayName,
      mappedRole: g.mappedRole,
      memberCount: g.memberExternalIds.length,
    }));
  }

  async setMapping(
    organizationId: string,
    dto: ScimMappingDto,
    actorUserId: string,
    req: Request,
  ) {
    if (dto.mappedRole === 'SUPER_ADMIN') {
      throw new ConflictException({
        code: 'SCIM_INVALID_ROLE_MAPPING',
        message: 'SUPER_ADMIN cannot be mapped via SCIM groups.',
      });
    }
    const group = await this.prisma.scimGroup.findUnique({
      where: {
        organizationId_externalId: {
          organizationId,
          externalId: dto.scimGroupExternalId,
        },
      },
    });
    if (!group) {
      throw new NotFoundException({
        code: 'SCIM_GROUP_NOT_FOUND',
        message: 'SCIM group not found for mapping.',
      });
    }
    const updated = await this.prisma.scimGroup.update({
      where: { id: group.id },
      data: { mappedRole: dto.mappedRole },
    });
    await this.applyGroupRoleMapping(organizationId, updated);
    await this.auditService.record({
      action: 'scim.mapping_updated',
      resource: `scim_group:${updated.id}`,
      userId: actorUserId,
      organizationId,
      request: req,
      after: { mappedRole: dto.mappedRole },
    });
    return {
      externalId: updated.externalId,
      mappedRole: updated.mappedRole,
    };
  }

  async getSyncStatus(organizationId: string) {
    const latest = await this.prisma.scimSyncRun.findFirst({
      where: { organizationId },
      orderBy: { startedAt: 'desc' },
    });
    const config = await this.getConfiguration(organizationId);
    return {
      configuration: config,
      latestRun: latest
        ? {
            id: latest.id,
            status: latest.status,
            usersCreated: latest.usersCreated,
            usersUpdated: latest.usersUpdated,
            usersDeactivated: latest.usersDeactivated,
            groupsSynced: latest.groupsSynced,
            errorMessage: latest.errorMessage,
            startedAt: latest.startedAt,
            finishedAt: latest.finishedAt,
          }
        : null,
    };
  }

  async recordSyncRun(
    organizationId: string,
    stats: {
      usersCreated: number;
      usersUpdated: number;
      usersDeactivated: number;
      groupsSynced: number;
      errorMessage?: string;
    },
  ) {
    return this.prisma.scimSyncRun.create({
      data: {
        organizationId,
        status: stats.errorMessage ? 'FAILED' : 'SUCCEEDED',
        usersCreated: stats.usersCreated,
        usersUpdated: stats.usersUpdated,
        usersDeactivated: stats.usersDeactivated,
        groupsSynced: stats.groupsSynced,
        errorMessage: stats.errorMessage ?? null,
        finishedAt: new Date(),
      },
    });
  }

  private async applyGroupRoleMapping(
    organizationId: string,
    group: {
      mappedRole: AppRole | null;
      memberExternalIds: string[];
    },
  ) {
    if (!group.mappedRole) {
      return;
    }
    for (const externalId of group.memberExternalIds) {
      const user = await this.prisma.user.findFirst({
        where: {
          OR: [{ externalId }, { email: externalId.toLowerCase() }],
        },
      });
      if (!user) {
        continue;
      }
      await this.prisma.organizationMembership.updateMany({
        where: { organizationId, userId: user.id },
        data: {
          appRole: group.mappedRole,
          role: appRoleToLegacyRole(group.mappedRole),
        },
      });
    }
  }

  private toScimUser(
    user: {
      id: string;
      email: string;
      name: string;
      externalId: string | null;
      active: boolean;
    },
    appRole: AppRole,
  ) {
    return {
      schemas: ['urn:ietf:params:scim:schemas:core:2.0:User'],
      id: user.id,
      externalId: user.externalId,
      userName: user.email,
      name: { formatted: user.name },
      emails: [{ value: user.email, primary: true, type: 'work' }],
      active: user.active,
      meta: { resourceType: 'User' },
      'urn:regintel:params:scim:schemas:extension:2.0:User': { appRole },
    };
  }

  private toScimGroup(group: {
    id: string;
    externalId: string;
    displayName: string;
    memberExternalIds: string[];
    mappedRole: AppRole | null;
  }) {
    return {
      schemas: ['urn:ietf:params:scim:schemas:core:2.0:Group'],
      id: group.id,
      externalId: group.externalId,
      displayName: group.displayName,
      members: group.memberExternalIds.map((value) => ({ value })),
      meta: { resourceType: 'Group' },
      'urn:regintel:params:scim:schemas:extension:2.0:Group': {
        mappedRole: group.mappedRole,
      },
    };
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }
}
