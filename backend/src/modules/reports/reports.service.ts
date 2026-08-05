import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AuditService } from '../../common/audit/audit.service';
import { IReportRepository } from '../../common/repositories/report.repository';
import { REPORT_REPOSITORY } from '../../common/repositories/tokens';
import { CreateReportsDto } from './dto/create.dto';
import { ListReportsQueryDto } from './dto/list-query.dto';
import { UpdateReportsDto } from './dto/update.dto';

@Injectable()
export class ReportsService {
  constructor(
    @Inject(REPORT_REPOSITORY)
    private readonly repo: IReportRepository,
    private readonly auditService: AuditService,
  ) {}

  list(organizationId: string, query: ListReportsQueryDto) {
    return this.repo.list({
      organizationId,
      page: query.page,
      pageSize: query.pageSize,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
      cursor: query.cursor,
      filters: {
        status: query.status,
      },
    });
  }

  async get(organizationId: string, id: string) {
    const row = await this.repo.findById(organizationId, id);
    if (!row) {
      throw new NotFoundException({
        code: 'REPORT_NOT_FOUND',
        message: 'Report not found.',
      });
    }
    return row;
  }

  async create(organizationId: string, userId: string, dto: CreateReportsDto) {
    const row = await this.repo.create({
      organizationId,
      title: dto.title,
      description: dto.description,
      reportType: dto.reportType,
      parameters: dto.parameters as never,
    });
    await this.auditService.record({
      action: 'report.create',
      resource: `report:${row.id}`,
      userId,
      organizationId,
      after: row,
    });
    return row;
  }

  async update(
    organizationId: string,
    userId: string,
    id: string,
    dto: UpdateReportsDto,
  ) {
    const row = await this.repo.update(organizationId, id, {
      title: dto.title,
      description: dto.description,
      status: dto.status as never,
      parameters: dto.parameters as never,
      resultUrl: dto.resultUrl,
    });
    if (!row) {
      throw new ConflictException({
        code: 'REPORT_UPDATE_CONFLICT',
        message: 'Report not found or version conflict.',
      });
    }
    await this.auditService.record({
      action: 'report.update',
      resource: `report:${id}`,
      userId,
      organizationId,
      after: row,
    });
    return row;
  }

  async remove(organizationId: string, userId: string, id: string) {
    const row = await this.repo.softDelete(organizationId, id);
    if (!row) {
      throw new NotFoundException({
        code: 'REPORT_NOT_FOUND',
        message: 'Report not found.',
      });
    }
    await this.auditService.record({
      action: 'report.delete',
      resource: `report:${id}`,
      userId,
      organizationId,
    });
    return { id, deleted: true };
  }
}
