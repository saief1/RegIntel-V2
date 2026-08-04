import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AuditService } from '../../common/audit/audit.service';
import {
  ICaseRepository,
} from '../../common/repositories/case.repository';
import { CASE_REPOSITORY } from '../../common/repositories/tokens';
import { CreateCasesDto } from './dto/create.dto';
import { ListCasesQueryDto } from './dto/list-query.dto';
import { UpdateCasesDto } from './dto/update.dto';

@Injectable()
export class CasesService {
  constructor(
    @Inject(CASE_REPOSITORY)
    private readonly repo: ICaseRepository,
    private readonly auditService: AuditService,
  ) {}

  list(organizationId: string, query: ListCasesQueryDto) {
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
        code: 'CASE_NOT_FOUND',
        message: 'Case not found.',
      });
    }
    return row;
  }

  async create(organizationId: string, userId: string, dto: CreateCasesDto) {
    const row = await this.repo.create({
      organizationId,
      title: dto.title, summary: dto.summary, status: dto.status as never, priority: dto.priority, ownerId: dto.ownerId, tags: dto.tags,
    });
    await this.auditService.record({
      action: 'case.create',
      resource: `case:${row.id}`,
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
    dto: UpdateCasesDto,
  ) {
    const row = await this.repo.update(organizationId, id, {
      title: dto.title, summary: dto.summary, status: dto.status as never, priority: dto.priority, ownerId: dto.ownerId, tags: dto.tags, expectedVersion: dto.expectedVersion,
    });
    if (!row) {
      throw new ConflictException({
        code: 'CASE_UPDATE_CONFLICT',
        message: 'Case not found or version conflict.',
      });
    }
    await this.auditService.record({
      action: 'case.update',
      resource: `case:${id}`,
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
        code: 'CASE_NOT_FOUND',
        message: 'Case not found.',
      });
    }
    await this.auditService.record({
      action: 'case.delete',
      resource: `case:${id}`,
      userId,
      organizationId,
    });
    return { id, deleted: true };
  }
}
