import { Injectable } from '@nestjs/common';
import { Prisma, Task, TaskLifecycleStatus } from '@prisma/client';
import { PageResult } from '../dto/pagination-query.dto';
import { PrismaService } from '../prisma/prisma.service';
import { BaseRepository } from './base.repository';
import { ListQuery } from './repository.types';

export type CreateTaskInput = {
  organizationId: string;
  title: string;
  description?: string | null;
  status?: TaskLifecycleStatus;
  priority?: string;
  caseId?: string | null;
  assigneeId?: string | null;
  createdById?: string | null;
  dueAt?: Date | null;
  tags?: string[];
};

export type UpdateTaskInput = {
  title?: string;
  description?: string | null;
  status?: TaskLifecycleStatus;
  priority?: string;
  caseId?: string | null;
  assigneeId?: string | null;
  dueAt?: Date | null;
  tags?: string[];
  expectedVersion?: number;
};

export interface ITaskRepository {
  list(query: ListQuery): Promise<PageResult<Task>>;
  findById(organizationId: string, id: string): Promise<Task | null>;
  create(input: CreateTaskInput): Promise<Task>;
  update(
    organizationId: string,
    id: string,
    input: UpdateTaskInput,
  ): Promise<Task | null>;
  softDelete(organizationId: string, id: string): Promise<Task | null>;
}

@Injectable()
export class TaskRepository extends BaseRepository implements ITaskRepository {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async list(query: ListQuery): Promise<PageResult<Task>> {
    const { page, pageSize, skip, sortBy, sortOrder } = this.pageParams(query);
    const where: Prisma.TaskWhereInput = {
      organizationId: query.organizationId,
      ...this.notDeleted(query.includeDeleted),
      ...(query.filters?.status ? { status: query.filters.status } : {}),
      ...(query.filters?.caseId
        ? {
            caseId:
              typeof query.filters.caseId === 'string' ||
              typeof query.filters.caseId === 'number' ||
              typeof query.filters.caseId === 'boolean'
                ? String(query.filters.caseId)
                : undefined,
          }
        : {}),
      ...(query.filters?.assigneeId
        ? {
            assigneeId:
              typeof query.filters.assigneeId === 'string' ||
              typeof query.filters.assigneeId === 'number' ||
              typeof query.filters.assigneeId === 'boolean'
                ? String(query.filters.assigneeId)
                : undefined,
          }
        : {}),
    };
    const [total, data] = await Promise.all([
      this.prisma.task.count({ where }),
      this.prisma.task.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { [sortBy]: sortOrder },
      }),
    ]);
    return this.toPageResult(data, total, page, pageSize);
  }

  findById(organizationId: string, id: string): Promise<Task | null> {
    return this.prisma.task.findFirst({
      where: { id, organizationId, deletedAt: null },
    });
  }

  create(input: CreateTaskInput): Promise<Task> {
    return this.prisma.task.create({
      data: { ...input, tags: input.tags ?? [] },
    });
  }

  async update(
    organizationId: string,
    id: string,
    input: UpdateTaskInput,
  ): Promise<Task | null> {
    const existing = await this.findById(organizationId, id);
    if (!existing) return null;
    if (
      input.expectedVersion !== undefined &&
      existing.version !== input.expectedVersion
    ) {
      return null;
    }
    const { expectedVersion: _ev, ...fields } = input;
    return this.prisma.task.update({
      where: { id },
      data: { ...fields, version: { increment: 1 } },
    });
  }

  async softDelete(organizationId: string, id: string): Promise<Task | null> {
    const existing = await this.findById(organizationId, id);
    if (!existing) return null;
    return this.prisma.task.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
