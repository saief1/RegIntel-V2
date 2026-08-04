import { Inject, Injectable } from '@nestjs/common';
import { IAuditEntryRepository } from '../../common/repositories/audit-entry.repository';
import { AUDIT_ENTRY_REPOSITORY } from '../../common/repositories/tokens';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

@Injectable()
export class AuditEntriesService {
  constructor(
    @Inject(AUDIT_ENTRY_REPOSITORY)
    private readonly repo: IAuditEntryRepository,
  ) {}

  list(organizationId: string, query: PaginationQueryDto) {
    return this.repo.list({
      organizationId,
      page: query.page,
      pageSize: query.pageSize,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
    });
  }
}
