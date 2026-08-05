import { Module, forwardRef } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AiModule } from '../ai/ai.module';
import { EmailModule } from '../email/email.module';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';
import { MetricsService } from './metrics.service';
import { ObservabilityService } from './observability.service';
import { RequestMetricsInterceptor } from './request-metrics.interceptor';
import { TimingService } from './timing.service';

@Module({
  imports: [EmailModule, forwardRef(() => AiModule)],
  controllers: [HealthController],
  providers: [
    HealthService,
    MetricsService,
    TimingService,
    ObservabilityService,
    RequestMetricsInterceptor,
    { provide: APP_INTERCEPTOR, useClass: RequestMetricsInterceptor },
  ],
  exports: [HealthService, MetricsService, TimingService, ObservabilityService],
})
export class HealthModule {}
