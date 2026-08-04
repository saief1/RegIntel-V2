import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomBytes } from 'crypto';
import { AuditService } from '../../common/audit/audit.service';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';

@Injectable()
export class OrganizationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async listForUser(userId: string) {
    const memberships = await this.prisma.organizationMembership.findMany({
      where: { userId, status: 'ACTIVE' },
      include: { organization: true },
      orderBy: { createdAt: 'asc' },
    });

    return {
      data: memberships.map((membership) => ({
        id: membership.organization.id,
        name: membership.organization.name,
        slug: membership.organization.slug,
        role: membership.role,
        createdAt: membership.organization.createdAt,
      })),
      meta: {
        page: 1,
        pageSize: memberships.length,
        total: memberships.length,
      },
    };
  }

  async create(userId: string, dto: CreateOrganizationDto) {
    const slug =
      dto.slug ??
      `${dto.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
        .slice(0, 48)}-${randomBytes(2).toString('hex')}`;

    const existing = await this.prisma.organization.findUnique({
      where: { slug },
    });
    if (existing) {
      throw new ConflictException({
        code: 'ORG_SLUG_EXISTS',
        message: 'An organization with this slug already exists.',
      });
    }

    const org = await this.prisma.$transaction(async (tx) => {
      const created = await tx.organization.create({
        data: { name: dto.name, slug },
      });
      await tx.organizationMembership.create({
        data: {
          userId,
          organizationId: created.id,
          role: 'OWNER',
          status: 'ACTIVE',
        },
      });
      return created;
    });

    await this.auditService.record({
      action: 'org.create',
      resource: `organization:${org.id}`,
      userId,
      organizationId: org.id,
      after: { name: org.name, slug: org.slug },
    });

    return {
      id: org.id,
      name: org.name,
      slug: org.slug,
      role: 'OWNER',
      createdAt: org.createdAt,
    };
  }

  async getByIdForMember(userId: string, organizationId: string) {
    const membership = await this.prisma.organizationMembership.findFirst({
      where: {
        userId,
        organizationId,
        status: 'ACTIVE',
      },
      include: { organization: true },
    });

    if (!membership) {
      throw new NotFoundException({
        code: 'ORG_NOT_FOUND',
        message: 'Organization not found for this user.',
      });
    }

    return {
      id: membership.organization.id,
      name: membership.organization.name,
      slug: membership.organization.slug,
      role: membership.role,
      createdAt: membership.organization.createdAt,
    };
  }
}
