import { PageResult } from '../dto/pagination-query.dto';

export type ListQuery = {
  organizationId: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  cursor?: string;
  includeDeleted?: boolean;
  filters?: Record<string, unknown>;
};

export type { PageResult };
