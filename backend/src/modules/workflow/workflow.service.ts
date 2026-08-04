import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AuditService } from '../../common/audit/audit.service';
import {
  IWorkflowRepository,
} from '../../common/repositories/workflow.repository';
import { WORKFLOW_REPOSITORY } from '../../common/repositories/tokens';
import { CreateWorkflowDto } from './dto/create.dto';
import { ListWorkflowQueryDto } from './dto/list-query.dto';
import { UpdateWorkflowDto } from './dto/update.dto';

@Injectable()
export class WorkflowService {
  constructor(
    @Inject(WORKFLOW_REPOSITORY)
    private readonly repo: IWorkflowRepository,
    private readonly auditService: AuditService,
  ) {}

  list(organizationId: string, query: ListWorkflowQueryDto) {
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
        code: 'WORKFLOW_NOT_FOUND',
        message: 'Workflow not found.',
      });
    }
    return row;
  }

  async create(organizationId: string, userId: string, dto: CreateWorkflowDto) {
    const row = await this.repo.create({
      organizationId,
      name: dto.name,
      description: dto.description,
      status: dto.status as never,
      definition: dto.definition as never,
    });
    await this.auditService.record({
      action: 'workflow.create',
      resource: `workflow:${row.id}`,
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
    dto: UpdateWorkflowDto,
  ) {
    const row = await this.repo.update(organizationId, id, {
      name: dto.name,
      description: dto.description,
      status: dto.status as never,
      definition: dto.definition as never,
      expectedVersion: dto.expectedVersion,
    });
    if (!row) {
      throw new ConflictException({
        code: 'WORKFLOW_UPDATE_CONFLICT',
        message: 'Workflow not found or version conflict.',
      });
    }
    await this.auditService.record({
      action: 'workflow.update',
      resource: `workflow:${id}`,
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
        code: 'WORKFLOW_NOT_FOUND',
        message: 'Workflow not found.',
      });
    }
    await this.auditService.record({
      action: 'workflow.delete',
      resource: `workflow:${id}`,
      userId,
      organizationId,
    });
    return { id, deleted: true };
  }
}
