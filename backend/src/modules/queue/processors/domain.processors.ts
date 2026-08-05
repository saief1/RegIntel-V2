import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Inject, Logger } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { Job } from 'bullmq';
import { AuditEntryRepository } from '../../../common/repositories/audit-entry.repository';
import { IAuditLogRepository } from '../../../common/repositories/audit-log.repository';
import { AUDIT_LOG_REPOSITORY } from '../../../common/repositories/tokens';
import { EmailService } from '../../email/email.service';
import { SearchService } from '../../search/search.service';
import { QUEUE_NAMES } from '../queue.constants';
import {
  AuditCleanupPayload,
  EmailJobPayload,
  NotificationDeliveryPayload,
  PolicyExpiryPayload,
  ReminderJobPayload,
  ReviewCyclePayload,
  SearchIndexPayload,
  SyncRetryPayload,
  WorkflowAutomationPayload,
} from '../jobs.service';

@Processor(QUEUE_NAMES.email)
export class EmailProcessor extends WorkerHost {
  private readonly logger = new Logger(EmailProcessor.name);

  constructor(private readonly moduleRef: ModuleRef) {
    super();
  }

  async process(job: Job<EmailJobPayload>): Promise<{ delivered: boolean }> {
    if (job.data.deliveryId) {
      try {
        const emailService = this.moduleRef.get(EmailService, {
          strict: false,
        });
        if (emailService) {
          const result = await emailService.deliverById(job.data.deliveryId);
          this.logger.log(
            `Email delivery ${job.data.deliveryId} ok=${result.ok} job=${job.id}`,
          );
          return { delivered: Boolean(result.ok) };
        }
      } catch (error) {
        this.logger.warn(
          `Email delivery fallback: ${error instanceof Error ? error.message : 'unknown'}`,
        );
      }
    }
    this.logger.log(
      `Email job ${job.id} → user=${job.data.userId} subject="${job.data.subject}"`,
    );
    return { delivered: true };
  }
}

@Processor(QUEUE_NAMES.reminder)
export class ReminderProcessor extends WorkerHost {
  private readonly logger = new Logger(ReminderProcessor.name);

  process(job: Job<ReminderJobPayload>): Promise<{ ok: boolean }> {
    this.logger.log(
      `Reminder job ${job.id} task=${job.data.taskId} due=${job.data.dueAt}`,
    );
    return Promise.resolve({ ok: true });
  }
}

@Processor(QUEUE_NAMES.reviewCycle)
export class ReviewCycleProcessor extends WorkerHost {
  private readonly logger = new Logger(ReviewCycleProcessor.name);

  process(job: Job<ReviewCyclePayload>): Promise<{ ok: boolean }> {
    this.logger.log(`Review cycle job ${job.id} policy=${job.data.policyId}`);
    return Promise.resolve({ ok: true });
  }
}

@Processor(QUEUE_NAMES.policyExpiry)
export class PolicyExpiryProcessor extends WorkerHost {
  private readonly logger = new Logger(PolicyExpiryProcessor.name);

  process(job: Job<PolicyExpiryPayload>): Promise<{ ok: boolean }> {
    this.logger.log(
      `Policy expiry job ${job.id} policy=${job.data.policyId} expires=${job.data.expiresAt}`,
    );
    return Promise.resolve({ ok: true });
  }
}

@Processor(QUEUE_NAMES.notificationDelivery)
export class NotificationDeliveryProcessor extends WorkerHost {
  private readonly logger = new Logger(NotificationDeliveryProcessor.name);

  process(job: Job<NotificationDeliveryPayload>): Promise<{ ok: boolean }> {
    this.logger.log(
      `Notification delivery ${job.id} id=${job.data.notificationId} channel=${job.data.channel}`,
    );
    return Promise.resolve({ ok: true });
  }
}

@Processor(QUEUE_NAMES.syncRetry)
export class SyncRetryProcessor extends WorkerHost {
  private readonly logger = new Logger(SyncRetryProcessor.name);

  process(job: Job<SyncRetryPayload>): Promise<{ ok: boolean }> {
    this.logger.log(
      `Sync retry ${job.id} type=${job.data.syncType} attempt=${job.data.attempt}`,
    );
    return Promise.resolve({ ok: true });
  }
}

@Processor(QUEUE_NAMES.workflowAutomation)
export class WorkflowAutomationProcessor extends WorkerHost {
  private readonly logger = new Logger(WorkflowAutomationProcessor.name);

  process(job: Job<WorkflowAutomationPayload>): Promise<{ ok: boolean }> {
    this.logger.log(
      `Workflow automation ${job.id} workflow=${job.data.workflowId} trigger=${job.data.trigger}`,
    );
    return Promise.resolve({ ok: true });
  }
}

@Processor(QUEUE_NAMES.auditCleanup)
export class AuditCleanupProcessor extends WorkerHost {
  private readonly logger = new Logger(AuditCleanupProcessor.name);

  constructor(
    private readonly auditEntries: AuditEntryRepository,
    @Inject(AUDIT_LOG_REPOSITORY)
    private readonly auditLogs: IAuditLogRepository,
  ) {
    super();
  }

  async process(
    job: Job<AuditCleanupPayload>,
  ): Promise<{ deletedEntries: number; purgedLogs: number }> {
    const days = job.data.olderThanDays ?? 365;
    const before = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const deletedEntries = await this.auditEntries.deleteOlderThan(before);
    const purgedLogs = await this.auditLogs.purgeOlderThan(before);
    this.logger.log(
      `Audit cleanup removed entries=${deletedEntries} logs=${purgedLogs} older than ${days}d`,
    );
    return { deletedEntries, purgedLogs };
  }
}

@Processor(QUEUE_NAMES.searchIndex)
export class SearchIndexProcessor extends WorkerHost {
  private readonly logger = new Logger(SearchIndexProcessor.name);

  constructor(private readonly moduleRef: ModuleRef) {
    super();
  }

  async process(job: Job<SearchIndexPayload>): Promise<{ indexed: number }> {
    try {
      const searchService = this.moduleRef.get(SearchService, {
        strict: false,
      });
      if (!searchService) {
        this.logger.warn('SearchService unavailable for index job');
        return { indexed: 0 };
      }
      if (job.data.mode === 'rebuild') {
        const result = await searchService.rebuild(job.data.organizationId);
        this.logger.log(
          `Search rebuild org=${job.data.organizationId} indexed=${result.indexed}`,
        );
        return { indexed: result.indexed };
      }
      if (job.data.entityType && job.data.entityId) {
        await searchService.indexEntity(
          job.data.organizationId,
          job.data.entityType,
          job.data.entityId,
        );
        return { indexed: 1 };
      }
      const result = await searchService.incremental(job.data.organizationId);
      return { indexed: result.indexed };
    } catch (error) {
      this.logger.warn(
        `Search index job failed: ${error instanceof Error ? error.message : 'unknown'}`,
      );
      return { indexed: 0 };
    }
  }
}
