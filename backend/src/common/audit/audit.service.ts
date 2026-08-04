import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Request } from 'express';
import { AUDIT_WRITER, AuditEvent, AuditWriter } from './audit.types';

@Injectable()
export class AuditService {
  constructor(@Inject(AUDIT_WRITER) private readonly writer: AuditWriter) {}

  async record(params: {
    action: string;
    resource: string;
    userId?: string | null;
    organizationId?: string | null;
    before?: unknown;
    after?: unknown;
    request?: Request;
  }): Promise<void> {
    const event: AuditEvent = {
      eventId: randomUUID(),
      userId: params.userId ?? null,
      organizationId: params.organizationId ?? null,
      action: params.action,
      resource: params.resource,
      before: params.before,
      after: params.after,
      timestamp: new Date().toISOString(),
      ipAddress: params.request?.ip ?? null,
      userAgent: params.request?.header('user-agent') ?? null,
    };
    await this.writer.write(event);
  }
}
