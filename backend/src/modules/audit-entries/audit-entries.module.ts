import { Module } from '@nestjs/common';
import { AuditEntriesController } from './audit-entries.controller';
import { AuditEntriesService } from './audit-entries.service';

@Module({
  controllers: [AuditEntriesController],
  providers: [AuditEntriesService],
})
export class AuditEntriesModule {}
