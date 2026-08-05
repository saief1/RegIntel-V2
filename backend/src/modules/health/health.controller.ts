import { Controller, Get, Header, Res } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { HealthService } from './health.service';
import { MetricsService } from './metrics.service';

@ApiTags('health')
@Controller()
export class HealthController {
  constructor(
    private readonly healthService: HealthService,
    private readonly metrics: MetricsService,
  ) {}

  @Get('health')
  @ApiOperation({
    operationId: 'healthCheck',
    summary: 'Aggregated health with dependency checks',
  })
  check() {
    return this.healthService.health();
  }

  @Get('liveness')
  @ApiOperation({
    operationId: 'livenessProbe',
    summary: 'Kubernetes liveness probe',
  })
  liveness() {
    return this.healthService.liveness();
  }

  @Get('readiness')
  @ApiOperation({
    operationId: 'readinessProbe',
    summary: 'Kubernetes readiness probe with dependency checks',
  })
  readiness() {
    return this.healthService.readiness();
  }

  @Get('metrics')
  @ApiOperation({
    operationId: 'prometheusMetrics',
    summary: 'Prometheus metrics scrape endpoint',
  })
  @Header('Content-Type', 'text/plain; version=0.0.4; charset=utf-8')
  metricsEndpoint(@Res() res: Response) {
    this.metrics.increment('regintel_metrics_scrapes_total');
    res.send(this.metrics.renderPrometheus());
  }

  @Get('ops/env')
  @ApiOperation({
    operationId: 'envDiagnostics',
    summary: 'Non-secret environment diagnostics',
  })
  envDiagnostics() {
    return this.healthService.envDiagnostics();
  }
}
