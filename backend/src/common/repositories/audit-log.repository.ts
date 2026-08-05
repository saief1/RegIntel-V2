import { Injectable } from '@nestjs/common';
import { AuditExport, AuditLog, Prisma } from '@prisma/client';
import { createHash } from 'crypto';
import { PageResult } from '../dto/pagination-query.dto';
import { PrismaService } from '../prisma/prisma.service';
import { BaseRepository } from './base.repository';

export type AuditLogListFilters = {
  action?: string;
  resource?: string;
  category?: string;
  userId?: string;
  requestId?: string;
  correlationId?: string;
  q?: string;
  from?: Date;
  to?: Date;
};

export type CreateAuditLogInput = {
  organizationId?: string | null;
  userId?: string | null;
  action: string;
  resource: string;
  category?: string;
  before?: Prisma.InputJsonValue;
  after?: Prisma.InputJsonValue;
  ipAddress?: string | null;
  userAgent?: string | null;
  device?: string | null;
  requestId?: string | null;
  correlationId?: string | null;
  createdAt?: Date;
};

export interface IAuditLogRepository {
  list(
    organizationId: string,
    page: number,
    pageSize: number,
    filters?: AuditLogListFilters,
  ): Promise<PageResult<AuditLog>>;
  create(input: CreateAuditLogInput): Promise<AuditLog>;
  exportRows(
    organizationId: string,
    filters?: AuditLogListFilters,
    limit?: number,
  ): Promise<AuditLog[]>;
  createExport(input: {
    organizationId: string;
    requestedById?: string | null;
    format: 'JSON' | 'CSV';
    filters?: Prisma.InputJsonValue;
  }): Promise<AuditExport>;
  completeExport(
    id: string,
    data: {
      status: 'READY' | 'FAILED';
      rowCount?: number;
      storageKey?: string;
      errorMessage?: string;
    },
  ): Promise<AuditExport>;
  listExports(
    organizationId: string,
    page: number,
    pageSize: number,
  ): Promise<PageResult<AuditExport>>;
  purgeOlderThan(before: Date): Promise<number>;
}

@Injectable()
export class AuditLogRepository
  extends BaseRepository
  implements IAuditLogRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  private where(
    organizationId: string,
    filters?: AuditLogListFilters,
  ): Prisma.AuditLogWhereInput {
    return {
      organizationId,
      ...(filters?.action ? { action: filters.action } : {}),
      ...(filters?.resource
        ? { resource: { contains: filters.resource, mode: 'insensitive' } }
        : {}),
      ...(filters?.category ? { category: filters.category } : {}),
      ...(filters?.userId ? { userId: filters.userId } : {}),
      ...(filters?.requestId ? { requestId: filters.requestId } : {}),
      ...(filters?.correlationId
        ? { correlationId: filters.correlationId }
        : {}),
      ...(filters?.q
        ? {
            OR: [
              { action: { contains: filters.q, mode: 'insensitive' } },
              { resource: { contains: filters.q, mode: 'insensitive' } },
              { category: { contains: filters.q, mode: 'insensitive' } },
            ],
          }
        : {}),
      ...(filters?.from || filters?.to
        ? {
            createdAt: {
              ...(filters.from ? { gte: filters.from } : {}),
              ...(filters.to ? { lte: filters.to } : {}),
            },
          }
        : {}),
    };
  }

  async list(
    organizationId: string,
    page: number,
    pageSize: number,
    filters?: AuditLogListFilters,
  ): Promise<PageResult<AuditLog>> {
    const skip = (page - 1) * pageSize;
    const where = this.where(organizationId, filters);
    const [total, data] = await Promise.all([
      this.prisma.auditLog.count({ where }),
      this.prisma.auditLog.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
    ]);
    return this.toPageResult(data, total, page, pageSize);
  }

  async create(input: CreateAuditLogInput): Promise<AuditLog> {
    const prev = await this.prisma.auditLog.findFirst({
      where: { organizationId: input.organizationId ?? null },
      orderBy: { createdAt: 'desc' },
      select: { entryHash: true },
    });
    const prevHash = prev?.entryHash ?? null;
    const createdAt = input.createdAt ?? new Date();
    const payload = JSON.stringify({
      organizationId: input.organizationId ?? null,
      userId: input.userId ?? null,
      action: input.action,
      resource: input.resource,
      category: input.category ?? 'general',
      before: input.before ?? null,
      after: input.after ?? null,
      requestId: input.requestId ?? null,
      correlationId: input.correlationId ?? null,
      prevHash,
      createdAt: createdAt.toISOString(),
    });
    const entryHash = createHash('sha256').update(payload).digest('hex');

    return this.prisma.auditLog.create({
      data: {
        organizationId: input.organizationId,
        userId: input.userId,
        action: input.action,
        resource: input.resource,
        category: input.category ?? 'general',
        before: input.before,
        after: input.after,
        ipAddress: input.ipAddress,
        userAgent: input.userAgent,
        device: input.device,
        requestId: input.requestId,
        correlationId: input.correlationId,
        entryHash,
        prevHash,
        createdAt,
      },
    });
  }

  exportRows(
    organizationId: string,
    filters?: AuditLogListFilters,
    limit = 10_000,
  ) {
    return this.prisma.auditLog.findMany({
      where: this.where(organizationId, filters),
      orderBy: { createdAt: 'asc' },
      take: limit,
    });
  }

  createExport(input: {
    organizationId: string;
    requestedById?: string | null;
    format: 'JSON' | 'CSV';
    filters?: Prisma.InputJsonValue;
  }) {
    return this.prisma.auditExport.create({
      data: {
        organizationId: input.organizationId,
        requestedById: input.requestedById,
        format: input.format,
        filters: input.filters,
        status: 'PENDING',
      },
    });
  }

  completeExport(
    id: string,
    data: {
      status: 'READY' | 'FAILED';
      rowCount?: number;
      storageKey?: string;
      errorMessage?: string;
    },
  ) {
    return this.prisma.auditExport.update({
      where: { id },
      data: {
        status: data.status,
        rowCount: data.rowCount,
        storageKey: data.storageKey,
        errorMessage: data.errorMessage,
        completedAt: new Date(),
      },
    });
  }

  async listExports(
    organizationId: string,
    page: number,
    pageSize: number,
  ): Promise<PageResult<AuditExport>> {
    const skip = (page - 1) * pageSize;
    const where = { organizationId };
    const [total, data] = await Promise.all([
      this.prisma.auditExport.count({ where }),
      this.prisma.auditExport.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
    ]);
    return this.toPageResult(data, total, page, pageSize);
  }

  async purgeOlderThan(before: Date): Promise<number> {
    await this.prisma
      .$executeRaw`SELECT set_config('regintel.allow_audit_purge', 'on', true)`;
    const result = await this.prisma.auditLog.deleteMany({
      where: { createdAt: { lt: before } },
    });
    return result.count;
  }
}
