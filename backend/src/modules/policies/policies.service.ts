import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AuditService } from '../../common/audit/audit.service';
import {
  IPolicyRepository,
} from '../../common/repositories/policy.repository';
import { POLICY_REPOSITORY } from '../../common/repositories/tokens';
import { CreatePoliciesDto } from './dto/create.dto';
import { ListPoliciesQueryDto } from './dto/list-query.dto';
import { UpdatePoliciesDto } from './dto/update.dto';

@Injectable()
export class PoliciesService {
  constructor(
    @Inject(POLICY_REPOSITORY)
    private readonly repo: IPolicyRepository,
    private readonly auditService: AuditService,
  ) {}

  list(organizationId: string, query: ListPoliciesQueryDto) {
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
        code: 'POLICY_NOT_FOUND',
        message: 'Policy not found.',
      });
    }
    return row;
  }

  async create(organizationId: string, userId: string, dto: CreatePoliciesDto) {
    const row = await this.repo.create({
      organizationId,
      title: dto.title, description: dto.description, status: dto.status as never, ownerName: dto.ownerName, category: dto.category, tags: dto.tags,
    });
    await this.auditService.record({
      action: 'policy.create',
      resource: `policy:${row.id}`,
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
    dto: UpdatePoliciesDto,
  ) {
    const row = await this.repo.update(organizationId, id, {
      title: dto.title, description: dto.description, status: dto.status as never, ownerName: dto.ownerName, category: dto.category, tags: dto.tags, expectedVersion: dto.expectedVersion,
    });
    if (!row) {
      throw new ConflictException({
        code: 'POLICY_UPDATE_CONFLICT',
        message: 'Policy not found or version conflict.',
      });
    }
    await this.auditService.record({
      action: 'policy.update',
      resource: `policy:${id}`,
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
        code: 'POLICY_NOT_FOUND',
        message: 'Policy not found.',
      });
    }
    await this.auditService.record({
      action: 'policy.delete',
      resource: `policy:${id}`,
      userId,
      organizationId,
    });
    return { id, deleted: true };
  }
}
