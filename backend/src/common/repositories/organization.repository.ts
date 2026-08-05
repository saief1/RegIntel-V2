import { Injectable } from '@nestjs/common';
import { Organization, OrganizationMembership, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export interface IOrganizationRepository {
  findById(id: string): Promise<Organization | null>;
  findBySlug(slug: string): Promise<Organization | null>;
  create(data: { name: string; slug: string }): Promise<Organization>;
  listMembershipsForUser(
    userId: string,
  ): Promise<Array<OrganizationMembership & { organization: Organization }>>;
  findActiveMembership(
    userId: string,
    organizationId: string,
  ): Promise<OrganizationMembership | null>;
  createMembership(
    data: Prisma.OrganizationMembershipCreateInput,
  ): Promise<OrganizationMembership>;
}

@Injectable()
export class OrganizationRepository implements IOrganizationRepository {
  constructor(private readonly prisma: PrismaService) {}

  findById(id: string) {
    return this.prisma.organization.findUnique({ where: { id } });
  }

  findBySlug(slug: string) {
    return this.prisma.organization.findUnique({ where: { slug } });
  }

  create(data: { name: string; slug: string }) {
    return this.prisma.organization.create({ data });
  }

  listMembershipsForUser(userId: string) {
    return this.prisma.organizationMembership.findMany({
      where: { userId, status: 'ACTIVE' },
      include: { organization: true },
      orderBy: { createdAt: 'asc' },
    });
  }

  findActiveMembership(userId: string, organizationId: string) {
    return this.prisma.organizationMembership.findFirst({
      where: { userId, organizationId, status: 'ACTIVE' },
    });
  }

  createMembership(data: Prisma.OrganizationMembershipCreateInput) {
    return this.prisma.organizationMembership.create({ data });
  }
}
