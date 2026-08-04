import { Global, Module } from '@nestjs/common';
import { AUDIT_WRITER } from './audit.types';
import { AuditService } from './audit.service';
import { LoggingAuditWriter } from './logging-audit.writer';

@Global()
@Module({
  providers: [
    LoggingAuditWriter,
    { provide: AUDIT_WRITER, useExisting: LoggingAuditWriter },
    AuditService,
  ],
  exports: [AuditService, AUDIT_WRITER],
})
export class AuditModule {}
