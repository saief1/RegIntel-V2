import { Injectable } from '@nestjs/common';
import { Prisma, SearchDocument, SearchEntityType } from '@prisma/client';
import { PageResult } from '../dto/pagination-query.dto';
import { PrismaService } from '../prisma/prisma.service';
import { BaseRepository } from './base.repository';

export type UpsertSearchDocumentInput = {
  organizationId: string;
  entityType: SearchEntityType;
  entityId: string;
  title: string;
  body?: string;
  metadata?: Prisma.InputJsonValue;
  rankBoost?: number;
};

export type SearchHit = SearchDocument & {
  rank: number;
  highlights: { title?: string; body?: string };
};

export interface ISearchRepository {
  upsert(input: UpsertSearchDocumentInput): Promise<SearchDocument>;
  remove(
    organizationId: string,
    entityType: SearchEntityType,
    entityId: string,
  ): Promise<number>;
  search(input: {
    organizationId: string;
    q: string;
    entityTypes?: SearchEntityType[];
    page: number;
    pageSize: number;
  }): Promise<PageResult<SearchHit>>;
  countByOrg(organizationId: string): Promise<number>;
  clearOrganization(organizationId: string): Promise<number>;
}

@Injectable()
export class SearchRepository
  extends BaseRepository
  implements ISearchRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  upsert(input: UpsertSearchDocumentInput) {
    return this.prisma.searchDocument.upsert({
      where: {
        organizationId_entityType_entityId: {
          organizationId: input.organizationId,
          entityType: input.entityType,
          entityId: input.entityId,
        },
      },
      create: {
        organizationId: input.organizationId,
        entityType: input.entityType,
        entityId: input.entityId,
        title: input.title,
        body: input.body ?? '',
        metadata: input.metadata,
        rankBoost: input.rankBoost ?? 1,
        indexedAt: new Date(),
      },
      update: {
        title: input.title,
        body: input.body ?? '',
        metadata: input.metadata,
        rankBoost: input.rankBoost ?? 1,
        indexedAt: new Date(),
      },
    });
  }

  async remove(
    organizationId: string,
    entityType: SearchEntityType,
    entityId: string,
  ) {
    const result = await this.prisma.searchDocument.deleteMany({
      where: { organizationId, entityType, entityId },
    });
    return result.count;
  }

  async search(input: {
    organizationId: string;
    q: string;
    entityTypes?: SearchEntityType[];
    page: number;
    pageSize: number;
  }): Promise<PageResult<SearchHit>> {
    const q = input.q.trim();
    const skip = (input.page - 1) * input.pageSize;
    const where: Prisma.SearchDocumentWhereInput = {
      organizationId: input.organizationId,
      ...(input.entityTypes?.length
        ? { entityType: { in: input.entityTypes } }
        : {}),
      ...(q
        ? {
            OR: [
              { title: { contains: q, mode: 'insensitive' } },
              { body: { contains: q, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [total, rows] = await Promise.all([
      this.prisma.searchDocument.count({ where }),
      this.prisma.searchDocument.findMany({
        where,
        skip,
        take: input.pageSize,
        orderBy: [{ rankBoost: 'desc' }, { updatedAt: 'desc' }],
      }),
    ]);

    const lower = q.toLowerCase();
    const data: SearchHit[] = rows.map((row, index) => {
      const titleMatch = lower && row.title.toLowerCase().includes(lower);
      const bodyMatch = lower && row.body.toLowerCase().includes(lower);
      const rank =
        (titleMatch ? 3 : 0) +
        (bodyMatch ? 1 : 0) +
        row.rankBoost -
        index * 0.01;
      return {
        ...row,
        rank,
        highlights: {
          title: titleMatch ? this.highlight(row.title, q) : undefined,
          body: bodyMatch
            ? this.highlight(this.snippet(row.body, q), q)
            : undefined,
        },
      };
    });
    data.sort((a, b) => b.rank - a.rank);
    return this.toPageResult(data, total, input.page, input.pageSize);
  }

  countByOrg(organizationId: string) {
    return this.prisma.searchDocument.count({ where: { organizationId } });
  }

  async clearOrganization(organizationId: string) {
    const result = await this.prisma.searchDocument.deleteMany({
      where: { organizationId },
    });
    return result.count;
  }

  private snippet(text: string, q: string, radius = 80): string {
    const idx = text.toLowerCase().indexOf(q.toLowerCase());
    if (idx < 0) return text.slice(0, radius * 2);
    const start = Math.max(0, idx - radius);
    const end = Math.min(text.length, idx + q.length + radius);
    return `${start > 0 ? '…' : ''}${text.slice(start, end)}${end < text.length ? '…' : ''}`;
  }

  private highlight(text: string, q: string): string {
    if (!q) return text;
    const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return text.replace(new RegExp(escaped, 'gi'), (m) => `<mark>${m}</mark>`);
  }
}
