import { NotificationKind } from '@prisma/client';
import { NotificationsService } from './notifications.service';

describe('NotificationsService', () => {
  const repo = {
    listForUser: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    markRead: jest.fn(),
    markAllRead: jest.fn(),
    archive: jest.fn(),
    getPreferences: jest.fn(),
    upsertPreferences: jest.fn(),
  };

  const auditService = { record: jest.fn() };
  const jobsService = {
    enqueueEmail: jest.fn(),
    enqueueNotificationDelivery: jest.fn(),
  };

  const service = new NotificationsService(
    repo,
    auditService as never,
    jobsService as never,
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('skips muted notification kinds', async () => {
    repo.getPreferences.mockResolvedValue({
      kindsMuted: [NotificationKind.MENTION],
    });

    const result = await service.create('org', 'actor', {
      userId: 'user',
      kind: NotificationKind.MENTION,
      title: 'Hi',
      body: 'There',
    });

    expect(result).toEqual({ skipped: true, reason: 'muted' });
    expect(repo.create).not.toHaveBeenCalled();
  });

  it('creates in-app notification and queues email delivery', async () => {
    repo.getPreferences.mockResolvedValue({
      emailEnabled: true,
      kindsMuted: [],
    });
    repo.create.mockResolvedValue({
      id: 'n1',
      kind: NotificationKind.ASSIGNMENT,
      userId: 'user',
    });

    const result = await service.create('org', 'actor', {
      userId: 'user',
      kind: NotificationKind.ASSIGNMENT,
      channel: 'EMAIL',
      title: 'Assigned',
      body: 'Task',
    });

    expect(result).toMatchObject({ id: 'n1' });
    expect(jobsService.enqueueEmail).toHaveBeenCalled();
    expect(jobsService.enqueueNotificationDelivery).toHaveBeenCalled();
    expect(auditService.record).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'notification.create' }),
    );
  });

  it('markAllRead delegates to repository', async () => {
    repo.markAllRead.mockResolvedValue(3);
    await expect(service.markAllRead('org', 'user')).resolves.toEqual({
      updated: 3,
    });
  });
});
