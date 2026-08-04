import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { AuditEntryRepository } from '../../../common/repositories/audit-entry.repository';
import { QUEUE_NAMES } from '../queue.constants';
import {
  AuditCleanupPayload,
  EmailJobPayload,
  NotificationDeliveryPayload,
  PolicyExpiryPayload,
  ReminderJobPayload,
  ReviewCyclePayload,
  SyncRetryPayload,
  WorkflowAutomationPayload,
} from '../jobs.service';

@Processor(QUEUE_NAMES.email)
export class EmailProcessor extends WorkerHost {
  private readonly logger = new Logger(EmailProcessor.name);

  async process(job: Job<EmailJobPayload>): Promise<{ delivered: boolean }> {
    this.logger.log(
      `Email job ${job.id} → user=${job.data.userId} subject="${job.data.subject}"`,
    );
    // Real SMTP provider lands in B016; log delivery for now.
    return { delivered: true };
  }
}

@Processor(QUEUE_NAMES.reminder)
export class ReminderProcessor extends WorkerHost {
  private readonly logger = new Logger(ReminderProcessor.name);

  async process(job: Job<ReminderJobPayload>): Promise<{ ok: boolean }> {
    this.logger.log(
      `Reminder job ${job.id} task=${job.data.taskId} due=${job.data.dueAt}`,
    );
    return { ok: true };
  }
}

@Processor(QUEUE_NAMES.reviewCycle)
export class ReviewCycleProcessor extends WorkerHost {
  private readonly logger = new Logger(ReviewCycleProcessor.name);

  async process(job: Job<ReviewCyclePayload>): Promise<{ ok: boolean }> {
    this.logger.log(
      `Review cycle job ${job.id} policy=${job.data.policyId}`,
    );
    return { ok: true };
  }
}

@Processor(QUEUE_NAMES.policyExpiry)
export class PolicyExpiryProcessor extends WorkerHost {
  private readonly logger = new Logger(PolicyExpiryProcessor.name);

  async process(job: Job<PolicyExpiryPayload>): Promise<{ ok: boolean }> {
    this.logger.log(
      `Policy expiry job ${job.id} policy=${job.data.policyId} expires=${job.data.expiresAt}`,
    );
    return { ok: true };
  }
}

@Processor(QUEUE_NAMES.notificationDelivery)
export class NotificationDeliveryProcessor extends WorkerHost {
  private readonly logger = new Logger(NotificationDeliveryProcessor.name);

  async process(
    job: Job<NotificationDeliveryPayload>,
  ): Promise<{ ok: boolean }> {
    this.logger.log(
      `Notification delivery ${job.id} id=${job.data.notificationId} channel=${job.data.channel}`,
    );
    return { ok: true };
  }
}

@Processor(QUEUE_NAMES.syncRetry)
export class SyncRetryProcessor extends WorkerHost {
  private readonly logger = new Logger(SyncRetryProcessor.name);

  async process(job: Job<SyncRetryPayload>): Promise<{ ok: boolean }> {
    this.logger.log(
      `Sync retry ${job.id} type=${job.data.syncType} attempt=${job.data.attempt}`,
    );
    return { ok: true };
  }
}

@Processor(QUEUE_NAMES.workflowAutomation)
export class WorkflowAutomationProcessor extends WorkerHost {
  private readonly logger = new Logger(WorkflowAutomationProcessor.name);

  async process(
    job: Job<WorkflowAutomationPayload>,
  ): Promise<{ ok: boolean }> {
    this.logger.log(
      `Workflow automation ${job.id} workflow=${job.data.workflowId} trigger=${job.data.trigger}`,
    );
    return { ok: true };
  }
}

@Processor(QUEUE_NAMES.auditCleanup)
export class AuditCleanupProcessor extends WorkerHost {
  private readonly logger = new Logger(AuditCleanupProcessor.name);

  constructor(private readonly auditEntries: AuditEntryRepository) {
    super();
  }

  async process(job: Job<AuditCleanupPayload>): Promise<{ deleted: number }> {
    const days = job.data.olderThanDays ?? 365;
    const before = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const deleted = await this.auditEntries.deleteOlderThan(before);
    this.logger.log(`Audit cleanup removed ${deleted} entries older than ${days}d`);
    return { deleted };
  }
}
