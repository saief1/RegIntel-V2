import { Injectable } from '@nestjs/common';
import { AuditEntry, Prisma } from '@prisma/client';
import { PageResult } from '../dto/pagination-query.dto';
import { PrismaService } from '../prisma/prisma.service';
import { BaseRepository } from './base.repository';
import { ListQuery } from './repository.types';

export type CreateAuditEntryInput = {
  organizationId?: string | null;
  userId?: string | null;
  action: string;
  resource: string;
  before?: Prisma.InputJsonValue;
  after?: Prisma.InputJsonValue;
  ipAddress?: string | null;
  userAgent?: string | null;
  requestId?: string | null;
};

export interface IAuditEntryRepository {
  list(query: ListQuery): Promise<PageResult<AuditEntry>>;
  create(input: CreateAuditEntryInput): Promise<AuditEntry>;
  deleteOlderThan(before: Date): Promise<number>;
}

@Injectable()
export class AuditEntryRepository
  extends BaseRepository
  implements IAuditEntryRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async list(query: ListQuery): Promise<PageResult<AuditEntry>> {
    const { page, pageSize, skip, sortBy, sortOrder } = this.pageParams(query);
    const where: Prisma.AuditEntryWhereInput = {
      organizationId: query.organizationId,
      ...(query.filters?.action
        ? {
            action:
              typeof query.filters.action === 'string' ||
              typeof query.filters.action === 'number' ||
              typeof query.filters.action === 'boolean'
                ? String(query.filters.action)
                : undefined,
          }
        : {}),
    };
    const [total, data] = await Promise.all([
      this.prisma.auditEntry.count({ where }),
      this.prisma.auditEntry.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { [sortBy === 'title' ? 'createdAt' : sortBy]: sortOrder },
      }),
    ]);
    return this.toPageResult(data, total, page, pageSize);
  }

  create(input: CreateAuditEntryInput) {
    return this.prisma.auditEntry.create({ data: input });
  }

  async deleteOlderThan(before: Date) {
    const result = await this.prisma.auditEntry.deleteMany({
      where: { createdAt: { lt: before } },
    });
    return result.count;
  }
}
