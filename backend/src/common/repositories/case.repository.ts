import { Injectable } from '@nestjs/common';
import { Case, CaseLifecycleStatus, Prisma } from '@prisma/client';
import { PageResult } from '../dto/pagination-query.dto';
import { PrismaService } from '../prisma/prisma.service';
import { BaseRepository } from './base.repository';
import { ListQuery } from './repository.types';

export type CreateCaseInput = {
  organizationId: string;
  title: string;
  summary?: string | null;
  status?: CaseLifecycleStatus;
  priority?: string;
  ownerId?: string | null;
  tags?: string[];
};

export type UpdateCaseInput = {
  title?: string;
  summary?: string | null;
  status?: CaseLifecycleStatus;
  priority?: string;
  ownerId?: string | null;
  tags?: string[];
  expectedVersion?: number;
};

export interface ICaseRepository {
  list(query: ListQuery): Promise<PageResult<Case>>;
  findById(organizationId: string, id: string): Promise<Case | null>;
  create(input: CreateCaseInput): Promise<Case>;
  update(
    organizationId: string,
    id: string,
    input: UpdateCaseInput,
  ): Promise<Case | null>;
  softDelete(organizationId: string, id: string): Promise<Case | null>;
}

@Injectable()
export class CaseRepository extends BaseRepository implements ICaseRepository {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async list(query: ListQuery): Promise<PageResult<Case>> {
    const { page, pageSize, skip, sortBy, sortOrder } = this.pageParams(query);
    const where: Prisma.CaseWhereInput = {
      organizationId: query.organizationId,
      ...this.notDeleted(query.includeDeleted),
      ...(query.filters?.status ? { status: query.filters.status } : {}),
    };
    const [total, data] = await Promise.all([
      this.prisma.case.count({ where }),
      this.prisma.case.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { [sortBy]: sortOrder },
      }),
    ]);
    return this.toPageResult(data, total, page, pageSize);
  }

  findById(organizationId: string, id: string): Promise<Case | null> {
    return this.prisma.case.findFirst({
      where: { id, organizationId, deletedAt: null },
    });
  }

  create(input: CreateCaseInput): Promise<Case> {
    return this.prisma.case.create({
      data: { ...input, tags: input.tags ?? [] },
    });
  }

  async update(
    organizationId: string,
    id: string,
    input: UpdateCaseInput,
  ): Promise<Case | null> {
    const existing = await this.findById(organizationId, id);
    if (!existing) return null;
    if (
      input.expectedVersion !== undefined &&
      existing.version !== input.expectedVersion
    ) {
      return null;
    }
    const { expectedVersion: _ev, ...fields } = input;
    return this.prisma.case.update({
      where: { id },
      data: { ...fields, version: { increment: 1 } },
    });
  }

  async softDelete(organizationId: string, id: string): Promise<Case | null> {
    const existing = await this.findById(organizationId, id);
    if (!existing) return null;
    return this.prisma.case.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
