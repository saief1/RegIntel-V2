import { Injectable } from '@nestjs/common';
import { KnowledgeDocument, Prisma } from '@prisma/client';
import { PageResult } from '../dto/pagination-query.dto';
import { PrismaService } from '../prisma/prisma.service';
import { BaseRepository } from './base.repository';
import { ListQuery } from './repository.types';

export type CreateKnowledgeInput = {
  organizationId: string;
  title: string;
  summary?: string | null;
  body?: string | null;
  collection?: string | null;
  status?: string;
  tags?: string[];
};

export type UpdateKnowledgeInput = {
  title?: string;
  summary?: string | null;
  body?: string | null;
  collection?: string | null;
  status?: string;
  tags?: string[];
  expectedVersion?: number;
};

export interface IKnowledgeRepository {
  list(query: ListQuery): Promise<PageResult<KnowledgeDocument>>;
  findById(
    organizationId: string,
    id: string,
  ): Promise<KnowledgeDocument | null>;
  create(input: CreateKnowledgeInput): Promise<KnowledgeDocument>;
  update(
    organizationId: string,
    id: string,
    input: UpdateKnowledgeInput,
  ): Promise<KnowledgeDocument | null>;
  softDelete(
    organizationId: string,
    id: string,
  ): Promise<KnowledgeDocument | null>;
}

@Injectable()
export class KnowledgeRepository
  extends BaseRepository
  implements IKnowledgeRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async list(query: ListQuery): Promise<PageResult<KnowledgeDocument>> {
    const { page, pageSize, skip, sortBy, sortOrder } = this.pageParams(query);
    const where: Prisma.KnowledgeDocumentWhereInput = {
      organizationId: query.organizationId,
      ...this.notDeleted(query.includeDeleted),
      ...(query.filters?.collection
        ? { collection: String(query.filters.collection) }
        : {}),
    };
    const [total, data] = await Promise.all([
      this.prisma.knowledgeDocument.count({ where }),
      this.prisma.knowledgeDocument.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { [sortBy]: sortOrder },
      }),
    ]);
    return this.toPageResult(data, total, page, pageSize);
  }

  findById(organizationId: string, id: string) {
    return this.prisma.knowledgeDocument.findFirst({
      where: { id, organizationId, deletedAt: null },
    });
  }

  create(input: CreateKnowledgeInput) {
    return this.prisma.knowledgeDocument.create({
      data: { ...input, tags: input.tags ?? [] },
    });
  }

  async update(
    organizationId: string,
    id: string,
    input: UpdateKnowledgeInput,
  ) {
    const existing = await this.findById(organizationId, id);
    if (!existing) return null;
    if (
      input.expectedVersion !== undefined &&
      existing.version !== input.expectedVersion
    ) {
      return null;
    }
    const { expectedVersion: _ev, ...fields } = input;
    return this.prisma.knowledgeDocument.update({
      where: { id },
      data: { ...fields, version: { increment: 1 } },
    });
  }

  async softDelete(organizationId: string, id: string) {
    const existing = await this.findById(organizationId, id);
    if (!existing) return null;
    return this.prisma.knowledgeDocument.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
