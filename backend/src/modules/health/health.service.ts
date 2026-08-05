import { Injectable, Optional } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../common/prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { JobsService } from '../queue/jobs.service';

export type DependencyStatus =
  'up' | 'down' | 'degraded' | 'unknown' | 'unconfigured';

@Injectable()
export class HealthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly jobs: JobsService,
    @Optional() private readonly email?: EmailService,
  ) {}

  liveness() {
    return {
      status: 'ok' as const,
      service: 'regintel-api',
      timestamp: new Date().toISOString(),
    };
  }

  async readiness() {
    const checks = await this.dependencyChecks();
    const criticalDown = checks.database === 'down' || checks.redis === 'down';
    return {
      status: criticalDown ? ('not_ready' as const) : ('ready' as const),
      checks,
      timestamp: new Date().toISOString(),
    };
  }

  async health() {
    const checks = await this.dependencyChecks();
    const status =
      checks.database !== 'up'
        ? 'down'
        : checks.redis === 'down' ||
            checks.queue === 'down' ||
            checks.email === 'down'
          ? 'degraded'
          : checks.redis === 'up'
            ? 'ok'
            : 'degraded';

    return {
      status,
      service: 'regintel-api',
      ...checks,
      version: '2.4.0',
      timestamp: new Date().toISOString(),
    };
  }

  async dependencyChecks() {
    const databaseUp = await this.prisma.ping();
    let redis: DependencyStatus = 'unknown';
    let queue: DependencyStatus = 'unknown';
    try {
      const stats = await this.jobs.getQueueStats();
      const hasBull = stats.queues.some((q) => q.mode === 'bullmq');
      redis = hasBull ? 'up' : 'unknown';
      queue = hasBull ? 'up' : 'degraded';
    } catch {
      redis = 'down';
      queue = 'down';
    }

    const storageProvider =
      this.config.get<string>('storage.provider') ?? 'local';
    const storage: DependencyStatus =
      storageProvider === 'local' ? 'up' : 'unknown';

    let email: DependencyStatus = 'unknown';
    let emailProvider = 'console';
    if (this.email) {
      const e = await this.email.healthCheck();
      emailProvider = e.provider;
      email = e.status;
    }

    return {
      database: (databaseUp ? 'up' : 'down') as DependencyStatus,
      redis,
      queue,
      storage,
      storageProvider,
      email,
      emailProvider,
    };
  }

  envDiagnostics() {
    const nodeEnv = this.config.get<string>('nodeEnv');
    return {
      nodeEnv,
      port: this.config.get<number>('port'),
      logLevel: this.config.get<string>('logLevel'),
      storageProvider: this.config.get<string>('storage.provider'),
      emailProvider: this.config.get<string>('email.provider'),
      searchProvider: this.config.get<string>('search.provider'),
      featureFlags: {
        useRealEmail: this.config.get<boolean>('featureFlags.useRealEmail'),
        useRealAudit: this.config.get<boolean>('featureFlags.useRealAudit'),
        useRealSearch: this.config.get<boolean>('featureFlags.useRealSearch'),
        useRealStorage: this.config.get<boolean>('featureFlags.useRealStorage'),
        useRealNotifications: this.config.get<boolean>(
          'featureFlags.useRealNotifications',
        ),
      },
      redisConfigured: Boolean(this.config.get<string>('redisUrl')),
      databaseConfigured: Boolean(this.config.get<string>('databaseUrl')),
    };
  }
}
