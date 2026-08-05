import { Injectable } from '@nestjs/common';
import {
  Attachment,
  Prisma,
  StorageObject,
  StorageProviderType,
} from '@prisma/client';
import { PageResult } from '../dto/pagination-query.dto';
import { PrismaService } from '../prisma/prisma.service';
import { BaseRepository } from './base.repository';
import { ListQuery } from './repository.types';

export type CreateStorageObjectInput = {
  organizationId: string;
  provider: StorageProviderType;
  bucket?: string | null;
  objectKey: string;
  filename: string;
  contentType: string;
  byteSize: number;
  checksumSha256?: string | null;
  versionLabel?: string;
  virusScanStatus?: string;
  metadata?: Prisma.InputJsonValue;
};

export interface IStorageObjectRepository {
  list(query: ListQuery): Promise<PageResult<StorageObject>>;
  findById(organizationId: string, id: string): Promise<StorageObject | null>;
  create(input: CreateStorageObjectInput): Promise<StorageObject>;
  softDelete(organizationId: string, id: string): Promise<StorageObject | null>;
  createAttachment(data: {
    organizationId: string;
    storageObjectId: string;
    ownerType: Attachment['ownerType'];
    ownerId: string;
    label?: string | null;
  }): Promise<Attachment>;
  listAttachments(
    organizationId: string,
    ownerType: Attachment['ownerType'],
    ownerId: string,
  ): Promise<Attachment[]>;
}

@Injectable()
export class StorageObjectRepository
  extends BaseRepository
  implements IStorageObjectRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async list(query: ListQuery): Promise<PageResult<StorageObject>> {
    const { page, pageSize, skip, sortBy, sortOrder } = this.pageParams(query);
    const where: Prisma.StorageObjectWhereInput = {
      organizationId: query.organizationId,
      ...this.notDeleted(query.includeDeleted),
    };
    const [total, data] = await Promise.all([
      this.prisma.storageObject.count({ where }),
      this.prisma.storageObject.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { [sortBy]: sortOrder },
      }),
    ]);
    return this.toPageResult(data, total, page, pageSize);
  }

  findById(organizationId: string, id: string) {
    return this.prisma.storageObject.findFirst({
      where: { id, organizationId, deletedAt: null },
    });
  }

  create(input: CreateStorageObjectInput) {
    return this.prisma.storageObject.create({ data: input });
  }

  async softDelete(organizationId: string, id: string) {
    const existing = await this.findById(organizationId, id);
    if (!existing) return null;
    return this.prisma.storageObject.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  createAttachment(data: {
    organizationId: string;
    storageObjectId: string;
    ownerType: Attachment['ownerType'];
    ownerId: string;
    label?: string | null;
  }) {
    return this.prisma.attachment.create({ data });
  }

  listAttachments(
    organizationId: string,
    ownerType: Attachment['ownerType'],
    ownerId: string,
  ) {
    return this.prisma.attachment.findMany({
      where: { organizationId, ownerType, ownerId, deletedAt: null },
      include: { storageObject: true },
      orderBy: { createdAt: 'desc' },
    });
  }
}
