import { Prisma } from '@prisma/client';
import { PageResult } from '../dto/pagination-query.dto';
import { PrismaService } from '../prisma/prisma.service';
import { ListQuery } from './repository.types';

const ALLOWED_SORT = new Set([
  'createdAt',
  'updatedAt',
  'title',
  'status',
  'dueAt',
  'name',
]);

export abstract class BaseRepository {
  constructor(protected readonly prisma: PrismaService) {}

  protected pageParams(query: ListQuery) {
    const page = Math.max(1, query.page ?? 1);
    const pageSize = Math.min(100, Math.max(1, query.pageSize ?? 20));
    const sortBy = ALLOWED_SORT.has(query.sortBy ?? '')
      ? (query.sortBy as string)
      : 'createdAt';
    const sortOrder: 'asc' | 'desc' =
      query.sortOrder === 'asc' ? 'asc' : 'desc';
    return { page, pageSize, skip: (page - 1) * pageSize, sortBy, sortOrder };
  }

  protected notDeleted(
    includeDeleted?: boolean,
  ): { deletedAt: null } | Record<string, never> {
    return includeDeleted ? {} : { deletedAt: null };
  }

  protected toPageResult<T>(
    data: T[],
    total: number,
    page: number,
    pageSize: number,
  ): PageResult<T> {
    return {
      data,
      meta: {
        page,
        pageSize,
        total,
        nextCursor:
          data.length === pageSize
            ? Buffer.from(
                JSON.stringify({ page: page + 1, pageSize }),
              ).toString('base64url')
            : null,
      },
    };
  }

  protected optimisticWhere(
    id: string,
    version?: number,
  ): { id: string; version?: number } {
    return version === undefined ? { id } : { id, version };
  }
}

export type DbClient = PrismaService | Prisma.TransactionClient;
