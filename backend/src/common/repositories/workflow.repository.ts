import { Injectable } from '@nestjs/common';
import { Prisma, Workflow, WorkflowStatus } from '@prisma/client';
import { PageResult } from '../dto/pagination-query.dto';
import { PrismaService } from '../prisma/prisma.service';
import { BaseRepository } from './base.repository';
import { ListQuery } from './repository.types';

export type CreateWorkflowInput = {
  organizationId: string;
  name: string;
  description?: string | null;
  status?: WorkflowStatus;
  definition: Prisma.InputJsonValue;
};

export type UpdateWorkflowInput = {
  name?: string;
  description?: string | null;
  status?: WorkflowStatus;
  definition?: Prisma.InputJsonValue;
  expectedVersion?: number;
};

export interface IWorkflowRepository {
  list(query: ListQuery): Promise<PageResult<Workflow>>;
  findById(organizationId: string, id: string): Promise<Workflow | null>;
  create(input: CreateWorkflowInput): Promise<Workflow>;
  update(
    organizationId: string,
    id: string,
    input: UpdateWorkflowInput,
  ): Promise<Workflow | null>;
  softDelete(organizationId: string, id: string): Promise<Workflow | null>;
}

@Injectable()
export class WorkflowRepository
  extends BaseRepository
  implements IWorkflowRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async list(query: ListQuery): Promise<PageResult<Workflow>> {
    const { page, pageSize, skip, sortBy, sortOrder } = this.pageParams(query);
    const where: Prisma.WorkflowWhereInput = {
      organizationId: query.organizationId,
      ...this.notDeleted(query.includeDeleted),
      ...(query.filters?.status ? { status: query.filters.status } : {}),
    };
    const [total, data] = await Promise.all([
      this.prisma.workflow.count({ where }),
      this.prisma.workflow.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { [sortBy]: sortOrder },
      }),
    ]);
    return this.toPageResult(data, total, page, pageSize);
  }

  findById(organizationId: string, id: string) {
    return this.prisma.workflow.findFirst({
      where: { id, organizationId, deletedAt: null },
    });
  }

  create(input: CreateWorkflowInput) {
    return this.prisma.workflow.create({ data: input });
  }

  async update(organizationId: string, id: string, input: UpdateWorkflowInput) {
    const existing = await this.findById(organizationId, id);
    if (!existing) return null;
    if (
      input.expectedVersion !== undefined &&
      existing.version !== input.expectedVersion
    ) {
      return null;
    }
    const { expectedVersion: _ev, ...fields } = input;
    return this.prisma.workflow.update({
      where: { id },
      data: { ...fields, version: { increment: 1 } },
    });
  }

  async softDelete(organizationId: string, id: string) {
    const existing = await this.findById(organizationId, id);
    if (!existing) return null;
    return this.prisma.workflow.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
