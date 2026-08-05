import { Controller, Get, Header, Res } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { ConfigPlatformService } from '../../config/config-platform.service';
import { HealthService } from './health.service';
import { MetricsService } from './metrics.service';
import { ObservabilityService } from './observability.service';

@ApiTags('health')
@Controller()
export class HealthController {
  constructor(
    private readonly healthService: HealthService,
    private readonly metrics: MetricsService,
    private readonly observability: ObservabilityService,
    private readonly configPlatform: ConfigPlatformService,
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

  @Get('ops/version')
  @ApiOperation({
    operationId: 'versionMetadata',
    summary: 'Version / build / deployment metadata',
  })
  version() {
    return this.configPlatform.getBuildMetadata();
  }

  @Get('ops/config')
  @ApiOperation({
    operationId: 'configChecksum',
    summary: 'Non-secret config checksum and feature flags',
  })
  config() {
    const diag = this.configPlatform.getStartupDiagnostics();
    return {
      configChecksum: diag.configChecksum,
      featureFlags: diag.featureFlags,
      secretsOk: diag.secrets.ok,
      warnings: diag.secrets.warnings,
      version: diag.version,
    };
  }

  @Get('ops/deployment')
  @ApiOperation({
    operationId: 'deploymentMetadata',
    summary: 'Deployment identity and readiness summary',
  })
  deployment() {
    const diag = this.configPlatform.getStartupDiagnostics();
    return {
      build: diag.build,
      configChecksum: diag.configChecksum,
      readyToServe: diag.readyToServe,
      dependencies: diag.dependencies,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('ops/diagnostics')
  @ApiOperation({
    operationId: 'systemDiagnostics',
    summary: 'System diagnostics for operators',
  })
  diagnostics() {
    return this.observability.systemDiagnostics();
  }

  @Get('ops/dashboard')
  @ApiOperation({
    operationId: 'healthDashboard',
    summary: 'Aggregated health dashboard payload',
  })
  dashboard() {
    return this.observability.dashboard();
  }

  @Get('ops/errors')
  @ApiOperation({
    operationId: 'errorAggregation',
    summary: 'In-process error aggregation summary',
  })
  errors() {
    return this.observability.errorSummary();
  }
}
