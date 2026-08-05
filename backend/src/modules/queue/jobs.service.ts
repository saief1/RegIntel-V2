import { Injectable, Logger, Optional } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { DEFAULT_JOB_OPTIONS, QUEUE_NAMES } from './queue.constants';

export type EmailJobPayload = {
  organizationId: string;
  userId: string;
  subject: string;
  body: string;
  notificationId?: string;
  /** Email delivery row id (B016). */
  deliveryId?: string;
  to?: string;
  templateKey?: string;
};

export type NotificationDeliveryPayload = {
  organizationId: string;
  notificationId: string;
  channel: 'EMAIL' | 'IN_APP' | 'DIGEST';
};

export type ReminderJobPayload = {
  organizationId: string;
  taskId: string;
  dueAt: string;
};

export type ReviewCyclePayload = {
  organizationId: string;
  policyId: string;
};

export type PolicyExpiryPayload = {
  organizationId: string;
  policyId: string;
  expiresAt: string;
};

export type SyncRetryPayload = {
  organizationId: string;
  syncType: string;
  attempt: number;
};

export type WorkflowAutomationPayload = {
  organizationId: string;
  workflowId: string;
  trigger: string;
};

export type AuditCleanupPayload = {
  olderThanDays: number;
};

export type SearchIndexPayload = {
  organizationId: string;
  mode: 'incremental' | 'rebuild';
  entityType?: string;
  entityId?: string;
};

/**
 * Queue abstraction. When BullMQ queues are unavailable (e.g. unit tests),
 * jobs are logged and processed in-process via optional handlers.
 */
@Injectable()
export class JobsService {
  private readonly logger = new Logger(JobsService.name);
  private readonly inProcessFallback: Array<{ name: string; data: unknown }> =
    [];

  constructor(
    @Optional()
    @InjectQueue(QUEUE_NAMES.email)
    private readonly emailQueue?: Queue,
    @Optional()
    @InjectQueue(QUEUE_NAMES.reminder)
    private readonly reminderQueue?: Queue,
    @Optional()
    @InjectQueue(QUEUE_NAMES.reviewCycle)
    private readonly reviewCycleQueue?: Queue,
    @Optional()
    @InjectQueue(QUEUE_NAMES.policyExpiry)
    private readonly policyExpiryQueue?: Queue,
    @Optional()
    @InjectQueue(QUEUE_NAMES.notificationDelivery)
    private readonly notificationQueue?: Queue,
    @Optional()
    @InjectQueue(QUEUE_NAMES.syncRetry)
    private readonly syncRetryQueue?: Queue,
    @Optional()
    @InjectQueue(QUEUE_NAMES.workflowAutomation)
    private readonly workflowQueue?: Queue,
    @Optional()
    @InjectQueue(QUEUE_NAMES.auditCleanup)
    private readonly auditCleanupQueue?: Queue,
    @Optional()
    @InjectQueue(QUEUE_NAMES.searchIndex)
    private readonly searchIndexQueue?: Queue,
  ) {}

  private async add<T>(
    queue: Queue | undefined,
    name: string,
    data: T,
  ): Promise<{ id: string; queue: string; mode: 'bullmq' | 'in-process' }> {
    if (!queue) {
      const id = `local-${Date.now()}`;
      this.inProcessFallback.push({ name, data });
      this.logger.debug(`In-process enqueue ${name}: ${JSON.stringify(data)}`);
      return { id, queue: name, mode: 'in-process' };
    }
    const job = await queue.add(name, data, DEFAULT_JOB_OPTIONS);
    return { id: String(job.id), queue: name, mode: 'bullmq' };
  }

  enqueueEmail(data: EmailJobPayload) {
    return this.add(this.emailQueue, QUEUE_NAMES.email, data);
  }

  enqueueReminder(data: ReminderJobPayload) {
    return this.add(this.reminderQueue, QUEUE_NAMES.reminder, data);
  }

  enqueueReviewCycle(data: ReviewCyclePayload) {
    return this.add(this.reviewCycleQueue, QUEUE_NAMES.reviewCycle, data);
  }

  enqueuePolicyExpiry(data: PolicyExpiryPayload) {
    return this.add(this.policyExpiryQueue, QUEUE_NAMES.policyExpiry, data);
  }

  enqueueNotificationDelivery(data: NotificationDeliveryPayload) {
    return this.add(
      this.notificationQueue,
      QUEUE_NAMES.notificationDelivery,
      data,
    );
  }

  enqueueSyncRetry(data: SyncRetryPayload) {
    return this.add(this.syncRetryQueue, QUEUE_NAMES.syncRetry, data);
  }

  enqueueWorkflowAutomation(data: WorkflowAutomationPayload) {
    return this.add(this.workflowQueue, QUEUE_NAMES.workflowAutomation, data);
  }

  enqueueAuditCleanup(data: AuditCleanupPayload) {
    return this.add(this.auditCleanupQueue, QUEUE_NAMES.auditCleanup, data);
  }

  enqueueSearchIndex(data: SearchIndexPayload) {
    return this.add(this.searchIndexQueue, QUEUE_NAMES.searchIndex, data);
  }

  getInProcessFallback() {
    return [...this.inProcessFallback];
  }

  async getQueueStats() {
    const queues = [
      ['email', this.emailQueue],
      ['reminder', this.reminderQueue],
      ['review-cycle', this.reviewCycleQueue],
      ['policy-expiry', this.policyExpiryQueue],
      ['notification-delivery', this.notificationQueue],
      ['sync-retry', this.syncRetryQueue],
      ['workflow-automation', this.workflowQueue],
      ['audit-cleanup', this.auditCleanupQueue],
      ['search-index', this.searchIndexQueue],
    ] as const;

    const stats = [];
    for (const [name, queue] of queues) {
      if (!queue) {
        stats.push({
          name,
          mode: 'in-process',
          waiting: 0,
          active: 0,
          completed: 0,
          failed: 0,
          delayed: 0,
          dlq: `${name}:dlq`,
        });
        continue;
      }
      const counts = await queue.getJobCounts(
        'waiting',
        'active',
        'completed',
        'failed',
        'delayed',
      );
      stats.push({
        name,
        mode: 'bullmq',
        ...counts,
        dlq: `${name}:dlq`,
      });
    }
    return {
      queues: stats,
      inProcessPending: this.inProcessFallback.length,
    };
  }
}
