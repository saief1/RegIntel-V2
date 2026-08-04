import { Injectable, Logger } from '@nestjs/common';
import { SecurityEventSeverity } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AuditEvent, AuditWriter } from './audit.types';

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
 * Persists security-relevant audit events for Security Center queries (v2.2.1).
 * Continues structured logging. Full immutable audit store remains B024.
 */
@Injectable()
export class PersistingAuditWriter implements AuditWriter {
  private readonly logger = new Logger('Audit');

  constructor(private readonly prisma: PrismaService) {}

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
