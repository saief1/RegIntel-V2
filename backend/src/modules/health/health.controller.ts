import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../../common/prisma/prisma.service';
import { JobsService } from '../queue/jobs.service';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly jobsService: JobsService,
  ) {}

  @Get()
  @ApiOperation({
    operationId: 'healthCheck',
    summary: 'Liveness and dependency readiness',
  })
  async check() {
    const databaseUp = await this.prisma.ping();
    let redis: 'up' | 'down' | 'unknown' = 'unknown';
    try {
      const stats = await this.jobsService.getQueueStats();
      redis = stats.queues.some((q) => q.mode === 'bullmq') ? 'up' : 'unknown';
    } catch {
      redis = 'down';
    }

    const status =
      databaseUp && redis !== 'down' ? 'ok' : databaseUp ? 'degraded' : 'down';

    return {
      status,
      service: 'regintel-api',
      database: databaseUp ? 'up' : 'down',
      redis,
      storageProvider: this.configService.get<string>('storage.provider'),
      timestamp: new Date().toISOString(),
    };
  }
}
