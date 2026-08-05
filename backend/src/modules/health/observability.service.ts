import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { globalErrorAggregator } from '../../common/logging/error-aggregator';
import { resolveLogLevel } from '../../common/logging/log-level';
import { ConfigPlatformService } from '../../config/config-platform.service';
import { APP_VERSION } from '../../config/version';
import { HealthService } from './health.service';
import { MetricsService } from './metrics.service';

@Injectable()
export class ObservabilityService {
  constructor(
    private readonly health: HealthService,
    private readonly metrics: MetricsService,
    private readonly configPlatform: ConfigPlatformService,
    private readonly config: ConfigService,
  ) {}

  async dashboard() {
    const health = await this.health.health();
    const readiness = await this.health.readiness();
    const errorSnapshot = globalErrorAggregator.snapshot(25);
    return {
      version: APP_VERSION,
      status: health.status,
      readiness: readiness.status,
      uptimeSeconds: process.uptime(),
      memory: process.memoryUsage(),
      logLevel: resolveLogLevel(this.config.get<string>('logLevel')),
      configChecksum: this.configPlatform.getConfigChecksum(),
      dependencies: health,
      errors: errorSnapshot,
      timestamp: new Date().toISOString(),
    };
  }

  systemDiagnostics() {
    const diag = this.configPlatform.getStartupDiagnostics();
    return {
      ...diag,
      uptimeSeconds: process.uptime(),
      memory: {
        rss: process.memoryUsage().rss,
        heapUsed: process.memoryUsage().heapUsed,
        heapTotal: process.memoryUsage().heapTotal,
      },
      logLevel: resolveLogLevel(this.config.get<string>('logLevel')),
      pid: process.pid,
      platform: process.platform,
      arch: process.arch,
      timestamp: new Date().toISOString(),
    };
  }

  errorSummary() {
    return globalErrorAggregator.snapshot();
  }

  /** Expose a tiny metrics summary for JSON consumers (Prometheus remains text). */
  metricsSummary() {
    return {
      note: 'Full exposition at GET /api/v1/metrics (Prometheus text)',
      sample: this.metrics.renderPrometheus().split('\n').slice(0, 12),
    };
  }
}
