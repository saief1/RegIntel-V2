import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Request } from 'express';
import {
  AUDIT_WRITER,
  AuditEvent,
  AuditWriter,
  categoryForAction,
} from './audit.types';

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
    category?: string;
    request?: Request;
    correlationId?: string | null;
    device?: string | null;
  }): Promise<void> {
    const requestId = params.request?.requestId ?? null;
    const event: AuditEvent = {
      eventId: randomUUID(),
      userId: params.userId ?? null,
      organizationId: params.organizationId ?? null,
      action: params.action,
      resource: params.resource,
      category: params.category ?? categoryForAction(params.action),
      before: params.before,
      after: params.after,
      timestamp: new Date().toISOString(),
      ipAddress: params.request?.ip ?? null,
      userAgent: params.request?.header('user-agent') ?? null,
      device: params.device ?? params.request?.header('x-device-id') ?? null,
      requestId,
      correlationId:
        params.correlationId ??
        params.request?.header('x-correlation-id') ??
        requestId,
    };
    await this.writer.write(event);
  }
}
