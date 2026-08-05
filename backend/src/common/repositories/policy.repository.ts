import { Injectable } from '@nestjs/common';
import {
  Policy,
  PolicyLifecycleStatus,
  PolicyVersion,
  Prisma,
} from '@prisma/client';
import { PageResult } from '../dto/pagination-query.dto';
import { PrismaService } from '../prisma/prisma.service';
import { BaseRepository } from './base.repository';
import { ListQuery } from './repository.types';

export type CreatePolicyInput = {
  organizationId: string;
  title: string;
  description?: string | null;
  status?: PolicyLifecycleStatus;
  ownerName?: string | null;
  category?: string | null;
  tags?: string[];
};

export type UpdatePolicyInput = {
  title?: string;
  description?: string | null;
  status?: PolicyLifecycleStatus;
  ownerName?: string | null;
  category?: string | null;
  tags?: string[];
  expectedVersion?: number;
};

export interface IPolicyRepository {
  list(query: ListQuery): Promise<PageResult<Policy>>;
  findById(organizationId: string, id: string): Promise<Policy | null>;
  create(input: CreatePolicyInput): Promise<Policy>;
  update(
    organizationId: string,
    id: string,
    input: UpdatePolicyInput,
  ): Promise<Policy | null>;
  softDelete(organizationId: string, id: string): Promise<Policy | null>;
  addVersion(
    policyId: string,
    data: {
      version: number;
      title: string;
      content: string;
      changeNotes?: string | null;
      createdById?: string | null;
    },
  ): Promise<PolicyVersion>;
  listVersions(policyId: string): Promise<PolicyVersion[]>;
}

@Injectable()
export class PolicyRepository
  extends BaseRepository
  implements IPolicyRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async list(query: ListQuery): Promise<PageResult<Policy>> {
    const { page, pageSize, skip, sortBy, sortOrder } = this.pageParams(query);
    const where: Prisma.PolicyWhereInput = {
      organizationId: query.organizationId,
      ...this.notDeleted(query.includeDeleted),
      ...(query.filters?.status ? { status: query.filters.status } : {}),
    };
    const [total, data] = await Promise.all([
      this.prisma.policy.count({ where }),
      this.prisma.policy.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { [sortBy]: sortOrder },
      }),
    ]);
    return this.toPageResult(data, total, page, pageSize);
  }

  findById(organizationId: string, id: string): Promise<Policy | null> {
    return this.prisma.policy.findFirst({
      where: { id, organizationId, deletedAt: null },
    });
  }

  create(input: CreatePolicyInput): Promise<Policy> {
    return this.prisma.policy.create({
      data: {
        organizationId: input.organizationId,
        title: input.title,
        description: input.description,
        status: input.status ?? 'DRAFT',
        ownerName: input.ownerName,
        category: input.category,
        tags: input.tags ?? [],
      },
    });
  }

  async update(
    organizationId: string,
    id: string,
    input: UpdatePolicyInput,
  ): Promise<Policy | null> {
    const existing = await this.findById(organizationId, id);
    if (!existing) return null;
    if (
      input.expectedVersion !== undefined &&
      existing.version !== input.expectedVersion
    ) {
      return null;
    }
    const { expectedVersion: _ev, ...fields } = input;
    return this.prisma.policy.update({
      where: { id },
      data: { ...fields, version: { increment: 1 } },
    });
  }

  async softDelete(organizationId: string, id: string): Promise<Policy | null> {
    const existing = await this.findById(organizationId, id);
    if (!existing) return null;
    return this.prisma.policy.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  addVersion(
    policyId: string,
    data: {
      version: number;
      title: string;
      content: string;
      changeNotes?: string | null;
      createdById?: string | null;
    },
  ): Promise<PolicyVersion> {
    return this.prisma.policyVersion.create({
      data: { policyId, ...data },
    });
  }

  listVersions(policyId: string): Promise<PolicyVersion[]> {
    return this.prisma.policyVersion.findMany({
      where: { policyId },
      orderBy: { version: 'desc' },
    });
  }
}
