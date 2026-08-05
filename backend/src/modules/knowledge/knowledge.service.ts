import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AuditService } from '../../common/audit/audit.service';
import { IKnowledgeRepository } from '../../common/repositories/knowledge.repository';
import { KNOWLEDGE_REPOSITORY } from '../../common/repositories/tokens';
import { CreateKnowledgeDto } from './dto/create.dto';
import { ListKnowledgeQueryDto } from './dto/list-query.dto';
import { UpdateKnowledgeDto } from './dto/update.dto';

@Injectable()
export class KnowledgeService {
  constructor(
    @Inject(KNOWLEDGE_REPOSITORY)
    private readonly repo: IKnowledgeRepository,
    private readonly auditService: AuditService,
  ) {}

  list(organizationId: string, query: ListKnowledgeQueryDto) {
    return this.repo.list({
      organizationId,
      page: query.page,
      pageSize: query.pageSize,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
      cursor: query.cursor,
      filters: {
        collection: query.collection,
      },
    });
  }

  async get(organizationId: string, id: string) {
    const row = await this.repo.findById(organizationId, id);
    if (!row) {
      throw new NotFoundException({
        code: 'KNOWLEDGE_NOT_FOUND',
        message: 'Document not found.',
      });
    }
    return row;
  }

  async create(
    organizationId: string,
    userId: string,
    dto: CreateKnowledgeDto,
  ) {
    const row = await this.repo.create({
      organizationId,
      title: dto.title,
      summary: dto.summary,
      body: dto.body,
      collection: dto.collection,
      status: dto.status,
      tags: dto.tags,
    });
    await this.auditService.record({
      action: 'knowledge.create',
      resource: `knowledge:${row.id}`,
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
    dto: UpdateKnowledgeDto,
  ) {
    const row = await this.repo.update(organizationId, id, {
      title: dto.title,
      summary: dto.summary,
      body: dto.body,
      collection: dto.collection,
      status: dto.status,
      tags: dto.tags,
      expectedVersion: dto.expectedVersion,
    });
    if (!row) {
      throw new ConflictException({
        code: 'KNOWLEDGE_UPDATE_CONFLICT',
        message: 'Document not found or version conflict.',
      });
    }
    await this.auditService.record({
      action: 'knowledge.update',
      resource: `knowledge:${id}`,
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
        code: 'KNOWLEDGE_NOT_FOUND',
        message: 'Document not found.',
      });
    }
    await this.auditService.record({
      action: 'knowledge.delete',
      resource: `knowledge:${id}`,
      userId,
      organizationId,
    });
    return { id, deleted: true };
  }
}
