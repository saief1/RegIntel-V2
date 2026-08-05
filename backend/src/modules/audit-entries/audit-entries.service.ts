import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IAuditEntryRepository } from '../../common/repositories/audit-entry.repository';
import {
  AuditLogListFilters,
  IAuditLogRepository,
} from '../../common/repositories/audit-log.repository';
import {
  AUDIT_ENTRY_REPOSITORY,
  AUDIT_LOG_REPOSITORY,
} from '../../common/repositories/tokens';
import { AuditExportDto } from './dto/export.dto';
import { AuditListQueryDto } from './dto/list-query.dto';

@Injectable()
export class AuditEntriesService {
  constructor(
    @Inject(AUDIT_ENTRY_REPOSITORY)
    private readonly legacyRepo: IAuditEntryRepository,
    @Inject(AUDIT_LOG_REPOSITORY)
    private readonly auditLogs: IAuditLogRepository,
    private readonly config: ConfigService,
  ) {}

  private filtersFromQuery(query: AuditListQueryDto): AuditLogListFilters {
    return {
      action: query.action,
      resource: query.resource,
      category: query.category,
      userId: query.userId,
      requestId: query.requestId,
      correlationId: query.correlationId,
      q: query.q,
      from: query.from ? new Date(query.from) : undefined,
      to: query.to ? new Date(query.to) : undefined,
    };
  }

  list(organizationId: string, query: AuditListQueryDto) {
    const useImmutable =
      this.config.get<boolean>('featureFlags.useRealAudit') === true;
    if (useImmutable) {
      return this.auditLogs.list(
        organizationId,
        query.page ?? 1,
        query.pageSize ?? 20,
        this.filtersFromQuery(query),
      );
    }
    return this.legacyRepo.list({
      organizationId,
      page: query.page,
      pageSize: query.pageSize,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
      filters: query.action ? { action: query.action } : undefined,
    });
  }

  listLogs(organizationId: string, query: AuditListQueryDto) {
    return this.auditLogs.list(
      organizationId,
      query.page ?? 1,
      query.pageSize ?? 20,
      this.filtersFromQuery(query),
    );
  }

  async export(
    organizationId: string,
    userId: string | undefined,
    body: AuditExportDto,
  ) {
    const format = body.format ?? 'JSON';
    const filters = body.filters ?? {};
    const exportRow = await this.auditLogs.createExport({
      organizationId,
      requestedById: userId,
      format,
      filters: filters,
    });

    try {
      const rows = await this.auditLogs.exportRows(organizationId, {
        action: filters.action,
        resource: filters.resource,
        category: filters.category,
        userId: filters.userId,
        requestId: filters.requestId,
        correlationId: filters.correlationId,
        q: filters.q,
        from: filters.from ? new Date(filters.from) : undefined,
        to: filters.to ? new Date(filters.to) : undefined,
      });

      let payload: string;
      if (format === 'CSV') {
        const header =
          'id,action,resource,category,userId,requestId,correlationId,createdAt,entryHash';
        const lines = rows.map((r) =>
          [
            r.id,
            r.action,
            r.resource,
            r.category,
            r.userId ?? '',
            r.requestId ?? '',
            r.correlationId ?? '',
            r.createdAt.toISOString(),
            r.entryHash,
          ]
            .map((v) => `"${String(v).replace(/"/g, '""')}"`)
            .join(','),
        );
        payload = [header, ...lines].join('\n');
      } else {
        payload = JSON.stringify(rows, null, 2);
      }

      const storageKey = `audit-exports/${organizationId}/${exportRow.id}.${format.toLowerCase()}`;
      const completed = await this.auditLogs.completeExport(exportRow.id, {
        status: 'READY',
        rowCount: rows.length,
        storageKey,
      });
      return { export: completed, payload };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'export_failed';
      const failed = await this.auditLogs.completeExport(exportRow.id, {
        status: 'FAILED',
        errorMessage: message,
      });
      return { export: failed, payload: null };
    }
  }

  listExports(organizationId: string, page = 1, pageSize = 20) {
    return this.auditLogs.listExports(organizationId, page, pageSize);
  }

  retentionPolicy() {
    return {
      retentionDays: this.config.get<number>('audit.retentionDays') ?? 365,
      immutable: true,
      store: 'audit_logs',
      legacyStore: 'audit_entries',
    };
  }
}
