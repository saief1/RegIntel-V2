import { Injectable } from '@nestjs/common';
import { Prisma, Report, ReportStatus } from '@prisma/client';
import { PageResult } from '../dto/pagination-query.dto';
import { PrismaService } from '../prisma/prisma.service';
import { BaseRepository } from './base.repository';
import { ListQuery } from './repository.types';

export type CreateReportInput = {
  organizationId: string;
  title: string;
  description?: string | null;
  reportType: string;
  status?: ReportStatus;
  parameters?: Prisma.InputJsonValue;
};

export type UpdateReportInput = {
  title?: string;
  description?: string | null;
  status?: ReportStatus;
  parameters?: Prisma.InputJsonValue;
  resultUrl?: string | null;
  generatedAt?: Date | null;
};

export interface IReportRepository {
  list(query: ListQuery): Promise<PageResult<Report>>;
  findById(organizationId: string, id: string): Promise<Report | null>;
  create(input: CreateReportInput): Promise<Report>;
  update(
    organizationId: string,
    id: string,
    input: UpdateReportInput,
  ): Promise<Report | null>;
  softDelete(organizationId: string, id: string): Promise<Report | null>;
}

@Injectable()
export class ReportRepository
  extends BaseRepository
  implements IReportRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async list(query: ListQuery): Promise<PageResult<Report>> {
    const { page, pageSize, skip, sortBy, sortOrder } = this.pageParams(query);
    const where: Prisma.ReportWhereInput = {
      organizationId: query.organizationId,
      ...this.notDeleted(query.includeDeleted),
      ...(query.filters?.status ? { status: query.filters.status } : {}),
    };
    const [total, data] = await Promise.all([
      this.prisma.report.count({ where }),
      this.prisma.report.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { [sortBy]: sortOrder },
      }),
    ]);
    return this.toPageResult(data, total, page, pageSize);
  }

  findById(organizationId: string, id: string) {
    return this.prisma.report.findFirst({
      where: { id, organizationId, deletedAt: null },
    });
  }

  create(input: CreateReportInput) {
    return this.prisma.report.create({ data: input });
  }

  async update(organizationId: string, id: string, input: UpdateReportInput) {
    const existing = await this.findById(organizationId, id);
    if (!existing) return null;
    return this.prisma.report.update({ where: { id }, data: input });
  }

  async softDelete(organizationId: string, id: string) {
    const existing = await this.findById(organizationId, id);
    if (!existing) return null;
    return this.prisma.report.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
