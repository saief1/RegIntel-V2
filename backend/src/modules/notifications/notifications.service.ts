import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { NotificationKind } from '@prisma/client';
import { AuditService } from '../../common/audit/audit.service';
import { INotificationRepository } from '../../common/repositories/notification.repository';
import { NOTIFICATION_REPOSITORY } from '../../common/repositories/tokens';
import { JobsService } from '../queue/jobs.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { ListNotificationsQueryDto } from './dto/list-notifications.dto';
import { UpdatePreferencesDto } from './dto/notification-actions.dto';

@Injectable()
export class NotificationsService {
  constructor(
    @Inject(NOTIFICATION_REPOSITORY)
    private readonly repo: INotificationRepository,
    private readonly auditService: AuditService,
    private readonly jobsService: JobsService,
  ) {}

  list(
    organizationId: string,
    userId: string,
    query: ListNotificationsQueryDto,
  ) {
    return this.repo.listForUser({
      organizationId,
      userId,
      page: query.page,
      pageSize: query.pageSize,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
      unreadOnly: query.unreadOnly,
      includeArchived: query.includeArchived,
      filters: { kind: query.kind },
    });
  }

  async get(organizationId: string, userId: string, id: string) {
    const row = await this.repo.findById(organizationId, userId, id);
    if (!row) {
      throw new NotFoundException({
        code: 'NOTIFICATION_NOT_FOUND',
        message: 'Notification not found.',
      });
    }
    return row;
  }

  async create(
    organizationId: string,
    actorUserId: string,
    dto: CreateNotificationDto,
  ) {
    const prefs = await this.repo.getPreferences(organizationId, dto.userId);
    const kind = dto.kind ?? NotificationKind.SYSTEM;
    if (prefs?.kindsMuted?.includes(kind)) {
      return { skipped: true, reason: 'muted' };
    }

    const notification = await this.repo.create({
      organizationId,
      userId: dto.userId,
      kind,
      channel: dto.channel ?? 'IN_APP',
      title: dto.title,
      body: dto.body,
      href: dto.href,
      groupLabel: dto.groupLabel,
      caseId: dto.caseId,
      taskId: dto.taskId,
    });

    if (prefs?.emailEnabled !== false && dto.channel !== 'IN_APP') {
      await this.jobsService.enqueueEmail({
        organizationId,
        userId: dto.userId,
        subject: dto.title,
        body: dto.body,
        notificationId: notification.id,
      });
    }

    if (dto.channel === 'EMAIL' || prefs?.emailEnabled) {
      await this.jobsService.enqueueNotificationDelivery({
        organizationId,
        notificationId: notification.id,
        channel: 'EMAIL',
      });
    }

    await this.auditService.record({
      action: 'notification.create',
      resource: `notification:${notification.id}`,
      userId: actorUserId,
      organizationId,
      after: { kind: notification.kind, userId: notification.userId },
    });

    return notification;
  }

  async markRead(organizationId: string, userId: string, ids: string[]) {
    const count = await this.repo.markRead(organizationId, userId, ids);
    return { updated: count };
  }

  async markAllRead(organizationId: string, userId: string) {
    const count = await this.repo.markAllRead(organizationId, userId);
    return { updated: count };
  }

  async archive(organizationId: string, userId: string, ids: string[]) {
    const count = await this.repo.archive(organizationId, userId, ids);
    return { archived: count };
  }

  async getPreferences(organizationId: string, userId: string) {
    const prefs = await this.repo.getPreferences(organizationId, userId);
    if (prefs) return prefs;
    return this.repo.upsertPreferences(organizationId, userId, {});
  }

  async updatePreferences(
    organizationId: string,
    userId: string,
    dto: UpdatePreferencesDto,
  ) {
    return this.repo.upsertPreferences(organizationId, userId, dto);
  }

  /** Helpers used by other domain services / workers. */
  notifyAssignment(params: {
    organizationId: string;
    userId: string;
    title: string;
    body: string;
    taskId?: string;
    caseId?: string;
    href?: string;
  }) {
    return this.repo.create({
      ...params,
      kind: NotificationKind.ASSIGNMENT,
      channel: 'IN_APP',
      groupLabel: 'Tasks',
    });
  }

  notifyApproval(params: {
    organizationId: string;
    userId: string;
    title: string;
    body: string;
    taskId?: string;
    caseId?: string;
    href?: string;
  }) {
    return this.repo.create({
      ...params,
      kind: NotificationKind.APPROVAL,
      channel: 'IN_APP',
      groupLabel: 'Approvals',
    });
  }

  notifyMention(params: {
    organizationId: string;
    userId: string;
    title: string;
    body: string;
    taskId?: string;
    caseId?: string;
    href?: string;
  }) {
    return this.repo.create({
      ...params,
      kind: NotificationKind.MENTION,
      channel: 'IN_APP',
      groupLabel: 'Mentions',
    });
  }

  notifyPolicyReview(params: {
    organizationId: string;
    userId: string;
    title: string;
    body: string;
    href?: string;
  }) {
    return this.repo.create({
      ...params,
      kind: NotificationKind.POLICY_REVIEW,
      channel: 'IN_APP',
      groupLabel: 'Policies',
    });
  }

  notifySecurityAlert(params: {
    organizationId: string;
    userId: string;
    title: string;
    body: string;
    href?: string;
  }) {
    return this.repo.create({
      ...params,
      kind: NotificationKind.SECURITY_ALERT,
      channel: 'IN_APP',
      groupLabel: 'Security',
    });
  }
}
