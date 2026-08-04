import { Injectable, Logger } from '@nestjs/common';
import { AuditEvent, AuditWriter } from './audit.types';

/**
 * B1 stub: emits audit-shaped structured logs.
 * Full immutable persistence lands in B024.
 */
@Injectable()
export class LoggingAuditWriter implements AuditWriter {
  private readonly logger = new Logger('Audit');

  write(event: AuditEvent): Promise<void> {
    this.logger.log(JSON.stringify({ audit: true, ...event }));
    return Promise.resolve();
  }
}
