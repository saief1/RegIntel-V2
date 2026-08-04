import { Injectable } from '@nestjs/common';
import { Prisma, SecurityEvent } from '@prisma/client';
import { PageResult } from '../dto/pagination-query.dto';
import { PrismaService } from '../prisma/prisma.service';
import { BaseRepository } from './base.repository';
import { ListQuery } from './repository.types';

export interface ISecurityEventRepository {
  list(query: ListQuery): Promise<PageResult<SecurityEvent>>;
  create(data: Prisma.SecurityEventCreateInput): Promise<SecurityEvent>;
}

@Injectable()
export class SecurityEventRepository
  extends BaseRepository
  implements ISecurityEventRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async list(query: ListQuery): Promise<PageResult<SecurityEvent>> {
    const { page, pageSize, skip, sortOrder } = this.pageParams(query);
    const where: Prisma.SecurityEventWhereInput = {
      organizationId: query.organizationId,
    };
    const [total, data] = await Promise.all([
      this.prisma.securityEvent.count({ where }),
      this.prisma.securityEvent.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: sortOrder as 'asc' | 'desc' },
      }),
    ]);
    return this.toPageResult(data, total, page, pageSize);
  }

  create(data: Prisma.SecurityEventCreateInput) {
    return this.prisma.securityEvent.create({ data });
  }
}
