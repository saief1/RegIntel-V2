import { Global, Module } from '@nestjs/common';
import { AUDIT_WRITER } from './audit.types';
import { AuditService } from './audit.service';
import { PersistingAuditWriter } from './persisting-audit.writer';

@Global()
@Module({
  providers: [
    PersistingAuditWriter,
    { provide: AUDIT_WRITER, useExisting: PersistingAuditWriter },
    AuditService,
  ],
  exports: [AuditService, AUDIT_WRITER],
})
export class AuditModule {}
