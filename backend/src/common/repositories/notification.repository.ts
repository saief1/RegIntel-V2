import { Injectable } from '@nestjs/common';
import {
  Notification,
  NotificationChannel,
  NotificationKind,
  NotificationPreference,
  Prisma,
} from '@prisma/client';
import { PageResult } from '../dto/pagination-query.dto';
import { PrismaService } from '../prisma/prisma.service';
import { BaseRepository } from './base.repository';
import { ListQuery } from './repository.types';

export type CreateNotificationInput = {
  organizationId: string;
  userId: string;
  kind?: NotificationKind;
  channel?: NotificationChannel;
  title: string;
  body: string;
  href?: string | null;
  groupLabel?: string | null;
  caseId?: string | null;
  taskId?: string | null;
  metadata?: Prisma.InputJsonValue;
};

export interface INotificationRepository {
  listForUser(query: ListQuery & { userId: string; unreadOnly?: boolean; includeArchived?: boolean }): Promise<PageResult<Notification>>;
  findById(organizationId: string, userId: string, id: string): Promise<Notification | null>;
  create(input: CreateNotificationInput): Promise<Notification>;
  markRead(organizationId: string, userId: string, ids: string[]): Promise<number>;
  markAllRead(organizationId: string, userId: string): Promise<number>;
  archive(organizationId: string, userId: string, ids: string[]): Promise<number>;
  getPreferences(organizationId: string, userId: string): Promise<NotificationPreference | null>;
  upsertPreferences(
    organizationId: string,
    userId: string,
    data: Partial<Omit<NotificationPreference, 'id' | 'organizationId' | 'userId' | 'createdAt' | 'updatedAt'>>,
  ): Promise<NotificationPreference>;
}

@Injectable()
export class NotificationRepository extends BaseRepository implements INotificationRepository {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async listForUser(
    query: ListQuery & { userId: string; unreadOnly?: boolean; includeArchived?: boolean },
  ): Promise<PageResult<Notification>> {
    const { page, pageSize, skip, sortBy, sortOrder } = this.pageParams(query);
    const where: Prisma.NotificationWhereInput = {
      organizationId: query.organizationId,
      userId: query.userId,
      deletedAt: null,
      ...(query.includeArchived ? {} : { archivedAt: null }),
      ...(query.unreadOnly ? { readAt: null } : {}),
      ...(query.filters?.kind
        ? { kind: query.filters.kind as NotificationKind }
        : {}),
    };
    const [total, data] = await Promise.all([
      this.prisma.notification.count({ where }),
      this.prisma.notification.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { [sortBy]: sortOrder },
      }),
    ]);
    return this.toPageResult(data, total, page, pageSize);
  }

  findById(organizationId: string, userId: string, id: string) {
    return this.prisma.notification.findFirst({
      where: { id, organizationId, userId, deletedAt: null },
    });
  }

  create(input: CreateNotificationInput) {
    return this.prisma.notification.create({ data: input });
  }

  async markRead(organizationId: string, userId: string, ids: string[]) {
    const result = await this.prisma.notification.updateMany({
      where: {
        organizationId,
        userId,
        id: { in: ids },
        deletedAt: null,
        readAt: null,
      },
      data: { readAt: new Date() },
    });
    return result.count;
  }

  async markAllRead(organizationId: string, userId: string) {
    const result = await this.prisma.notification.updateMany({
      where: {
        organizationId,
        userId,
        deletedAt: null,
        archivedAt: null,
        readAt: null,
      },
      data: { readAt: new Date() },
    });
    return result.count;
  }

  async archive(organizationId: string, userId: string, ids: string[]) {
    const result = await this.prisma.notification.updateMany({
      where: {
        organizationId,
        userId,
        id: { in: ids },
        deletedAt: null,
      },
      data: { archivedAt: new Date() },
    });
    return result.count;
  }

  getPreferences(organizationId: string, userId: string) {
    return this.prisma.notificationPreference.findUnique({
      where: {
        organizationId_userId: { organizationId, userId },
      },
    });
  }

  upsertPreferences(
    organizationId: string,
    userId: string,
    data: Partial<
      Omit<
        NotificationPreference,
        'id' | 'organizationId' | 'userId' | 'createdAt' | 'updatedAt'
      >
    >,
  ) {
    return this.prisma.notificationPreference.upsert({
      where: { organizationId_userId: { organizationId, userId } },
      create: {
        organizationId,
        userId,
        inAppEnabled: data.inAppEnabled ?? true,
        emailEnabled: data.emailEnabled ?? true,
        digestEnabled: data.digestEnabled ?? false,
        digestHourUtc: data.digestHourUtc ?? 8,
        kindsMuted: data.kindsMuted ?? [],
      },
      update: data,
    });
  }
}
