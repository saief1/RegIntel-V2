import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { JobsService } from './jobs.service';

@ApiTags('jobs')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Get('stats')
  @ApiOperation({
    operationId: 'jobsStats',
    summary: 'Queue monitoring stats (waiting/active/failed + DLQ names)',
  })
  stats() {
    return this.jobsService.getQueueStats();
  }

  @Post('audit-cleanup')
  @ApiOperation({
    operationId: 'jobsEnqueueAuditCleanup',
    summary: 'Enqueue audit cleanup job (older than 365 days)',
  })
  enqueueAuditCleanup() {
    return this.jobsService.enqueueAuditCleanup({ olderThanDays: 365 });
  }
}
