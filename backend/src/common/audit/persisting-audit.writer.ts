import { Inject, Injectable, Logger } from '@nestjs/common';
import { Prisma, SecurityEventSeverity } from '@prisma/client';
import { IAuditLogRepository } from '../repositories/audit-log.repository';
import { AUDIT_LOG_REPOSITORY } from '../repositories/tokens';
import { PrismaService } from '../prisma/prisma.service';
import { AuditEvent, AuditWriter, categoryForAction } from './audit.types';

const HIGH_ACTIONS = new Set([
  'auth.refresh_reuse',
  'auth.suspicious_failures',
  'auth.logout_all',
  'session.revoked',
  'mfa.disabled',
]);

const MEDIUM_ACTIONS = new Set([
  'auth.login_failed',
  'mfa.verified',
  'auth.password_changed',
  'device.revoked',
  'device.trusted',
]);

/**
 * Persists security_events, legacy audit_entries, and immutable audit_logs (B017).
 */
@Injectable()
export class PersistingAuditWriter implements AuditWriter {
  private readonly logger = new Logger('Audit');

  constructor(
    private readonly prisma: PrismaService,
    @Inject(AUDIT_LOG_REPOSITORY)
    private readonly auditLogs: IAuditLogRepository,
  ) {}

  async write(event: AuditEvent): Promise<void> {
    this.logger.log(JSON.stringify({ audit: true, ...event }));
    try {
      await this.prisma.securityEvent.create({
        data: {
          id: event.eventId,
          userId: event.userId,
          organizationId: event.organizationId,
          action: event.action,
          resource: event.resource,
          severity: this.severityFor(event.action),
          detail: event.after
            ? JSON.stringify(event.after).slice(0, 2000)
            : null,
          ipAddress: event.ipAddress,
          userAgent: event.userAgent,
          metadata: {
            before: event.before ?? null,
            after: event.after ?? null,
            requestId: event.requestId ?? null,
            correlationId: event.correlationId ?? null,
          },
          createdAt: new Date(event.timestamp),
        },
      });
    } catch (error) {
      this.logger.warn(
        `Failed to persist security event ${event.action}: ${
          error instanceof Error ? error.message : 'unknown'
        }`,
      );
    }

    try {
      await this.prisma.auditEntry.create({
        data: {
          organizationId: event.organizationId,
          userId: event.userId,
          action: event.action,
          resource: event.resource,
          before:
            event.before === undefined
              ? undefined
              : (event.before as Prisma.InputJsonValue),
          after:
            event.after === undefined
              ? undefined
              : (event.after as Prisma.InputJsonValue),
          ipAddress: event.ipAddress,
          userAgent: event.userAgent,
          requestId: event.requestId,
          createdAt: new Date(event.timestamp),
        },
      });
    } catch (error) {
      this.logger.warn(
        `Failed to persist audit entry ${event.action}: ${
          error instanceof Error ? error.message : 'unknown'
        }`,
      );
    }

    try {
      await this.auditLogs.create({
        organizationId: event.organizationId,
        userId: event.userId,
        action: event.action,
        resource: event.resource,
        category: event.category ?? categoryForAction(event.action),
        before:
          event.before === undefined
            ? undefined
            : (event.before as Prisma.InputJsonValue),
        after:
          event.after === undefined
            ? undefined
            : (event.after as Prisma.InputJsonValue),
        ipAddress: event.ipAddress,
        userAgent: event.userAgent,
        device: event.device,
        requestId: event.requestId,
        correlationId: event.correlationId,
        createdAt: new Date(event.timestamp),
      });
    } catch (error) {
      this.logger.warn(
        `Failed to persist audit log ${event.action}: ${
          error instanceof Error ? error.message : 'unknown'
        }`,
      );
    }
  }

  private severityFor(action: string): SecurityEventSeverity {
    if (HIGH_ACTIONS.has(action) || action.includes('suspicious')) {
      return 'HIGH';
    }
    if (MEDIUM_ACTIONS.has(action) || action.includes('failed')) {
      return 'MEDIUM';
    }
    return 'LOW';
  }
}
