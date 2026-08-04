import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AuditService } from '../../common/audit/audit.service';
import {
  ITaskRepository,
} from '../../common/repositories/task.repository';
import { TASK_REPOSITORY } from '../../common/repositories/tokens';
import { CreateTasksDto } from './dto/create.dto';
import { ListTasksQueryDto } from './dto/list-query.dto';
import { UpdateTasksDto } from './dto/update.dto';

@Injectable()
export class TasksService {
  constructor(
    @Inject(TASK_REPOSITORY)
    private readonly repo: ITaskRepository,
    private readonly auditService: AuditService,
  ) {}

  list(organizationId: string, query: ListTasksQueryDto) {
    return this.repo.list({
      organizationId,
      page: query.page,
      pageSize: query.pageSize,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
      cursor: query.cursor,
      filters: {
        status: query.status,
        
        caseId: (query as any).caseId, assigneeId: (query as any).assigneeId,
      },
    });
  }

  async get(organizationId: string, id: string) {
    const row = await this.repo.findById(organizationId, id);
    if (!row) {
      throw new NotFoundException({
        code: 'TASK_NOT_FOUND',
        message: 'Task not found.',
      });
    }
    return row;
  }

  async create(organizationId: string, userId: string, dto: CreateTasksDto) {
    const row = await this.repo.create({
      organizationId,
      title: dto.title, description: dto.description, status: dto.status as never, priority: dto.priority, caseId: dto.caseId, assigneeId: dto.assigneeId, createdById: userId, dueAt: dto.dueAt ? new Date(dto.dueAt) : undefined, tags: dto.tags,
    });
    await this.auditService.record({
      action: 'task.create',
      resource: `task:${row.id}`,
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
    dto: UpdateTasksDto,
  ) {
    const row = await this.repo.update(organizationId, id, {
      title: dto.title, description: dto.description, status: dto.status as never, priority: dto.priority, caseId: dto.caseId, assigneeId: dto.assigneeId, dueAt: dto.dueAt === undefined ? undefined : dto.dueAt ? new Date(dto.dueAt) : null, tags: dto.tags, expectedVersion: dto.expectedVersion,
    });
    if (!row) {
      throw new ConflictException({
        code: 'TASK_UPDATE_CONFLICT',
        message: 'Task not found or version conflict.',
      });
    }
    await this.auditService.record({
      action: 'task.update',
      resource: `task:${id}`,
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
        code: 'TASK_NOT_FOUND',
        message: 'Task not found.',
      });
    }
    await this.auditService.record({
      action: 'task.delete',
      resource: `task:${id}`,
      userId,
      organizationId,
    });
    return { id, deleted: true };
  }
}
