import { createHash } from 'crypto';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { structuredLog } from '../common/logging/structured-logger';
import { APP_VERSION, getBuildMetadata } from './version';

export type SecretValidationResult = {
  ok: boolean;
  issues: string[];
  warnings: string[];
};

export type StartupDiagnostics = {
  version: string;
  build: ReturnType<typeof getBuildMetadata>;
  configChecksum: string;
  secrets: SecretValidationResult;
  dependencies: {
    databaseUrlConfigured: boolean;
    redisUrlConfigured: boolean;
    storageProvider: string;
    emailProvider: string;
  };
  featureFlags: Record<string, boolean | undefined>;
  readyToServe: boolean;
};

@Injectable()
export class ConfigPlatformService implements OnModuleInit {
  private checksum = '';
  private diagnostics!: StartupDiagnostics;

  constructor(private readonly config: ConfigService) {}

  onModuleInit(): void {
    this.checksum = this.computeConfigChecksum();
    this.diagnostics = this.buildDiagnostics();
    structuredLog('info', 'Startup diagnostics', {
      version: this.diagnostics.version,
      configChecksum: this.checksum,
      secretsOk: this.diagnostics.secrets.ok,
      readyToServe: this.diagnostics.readyToServe,
      gitSha: this.diagnostics.build.gitSha,
    });
    if (!this.diagnostics.secrets.ok) {
      const nodeEnv = this.config.get<string>('nodeEnv');
      if (nodeEnv === 'production') {
        throw new Error(
          `Secret validation failed in production: ${this.diagnostics.secrets.issues.join('; ')}`,
        );
      }
      structuredLog('warn', 'Secret validation issues (non-production)', {
        issues: this.diagnostics.secrets.issues,
        warnings: this.diagnostics.secrets.warnings,
      });
    }
  }

  getConfigChecksum(): string {
    return this.checksum || this.computeConfigChecksum();
  }

  getStartupDiagnostics(): StartupDiagnostics {
    return this.diagnostics ?? this.buildDiagnostics();
  }

  getBuildMetadata() {
    return getBuildMetadata();
  }

  validateSecrets(): SecretValidationResult {
    const issues: string[] = [];
    const warnings: string[] = [];
    const nodeEnv = this.config.get<string>('nodeEnv') ?? 'development';
    const jwt = this.config.get<string>('jwt.accessSecret') ?? '';
    const mfaKey = this.config.get<string>('mfaEncryptionKey') ?? '';
    const cookieSecure = this.config.get<boolean>('cookieSecure') ?? false;
    const allowRegister = this.config.get<boolean>('allowRegister') ?? false;

    if (jwt.length < 32) {
      issues.push('JWT_ACCESS_SECRET must be at least 32 characters');
    }
    if (/change-me|dev-access|secret/i.test(jwt) && nodeEnv === 'production') {
      issues.push('JWT_ACCESS_SECRET appears to be a development placeholder');
    } else if (/change-me|dev-access/i.test(jwt)) {
      warnings.push('JWT_ACCESS_SECRET looks like a development placeholder');
    }

    if (mfaKey.length < 32) {
      issues.push('MFA_ENCRYPTION_KEY must be at least 32 characters');
    }
    if (/change-me|dev-mfa/i.test(mfaKey) && nodeEnv === 'production') {
      issues.push('MFA_ENCRYPTION_KEY appears to be a development placeholder');
    }

    if (nodeEnv === 'production' && !cookieSecure) {
      issues.push('COOKIE_SECURE must be true in production');
    }
    if (nodeEnv === 'production' && allowRegister) {
      warnings.push(
        'ALLOW_REGISTER=true in production — ensure this is intentional',
      );
    }

    const emailProvider =
      this.config.get<string>('email.provider') ?? 'console';
    if (nodeEnv === 'production' && emailProvider === 'console') {
      warnings.push('EMAIL_PROVIDER=console in production');
    }

    return { ok: issues.length === 0, issues, warnings };
  }

  private computeConfigChecksum(): string {
    const material = JSON.stringify({
      nodeEnv: this.config.get('nodeEnv'),
      port: this.config.get('port'),
      corsOrigins: this.config.get('corsOrigins'),
      cookieSecure: this.config.get('cookieSecure'),
      logLevel: this.config.get('logLevel'),
      allowRegister: this.config.get('allowRegister'),
      storageProvider: this.config.get('storage.provider'),
      emailProvider: this.config.get('email.provider'),
      searchProvider: this.config.get('search.provider'),
      tenantDefaultPlan: this.config.get('tenant.defaultPlan'),
      tenantRpm: this.config.get('tenant.defaultRateLimitPerMinute'),
      jwtAccessTtl: this.config.get('jwt.accessTtl'),
      jwtRefreshTtl: this.config.get('jwt.refreshTtl'),
      featureFlags: this.config.get('featureFlags'),
      version: APP_VERSION,
    });
    return createHash('sha256').update(material).digest('hex').slice(0, 16);
  }

  private buildDiagnostics(): StartupDiagnostics {
    const secrets = this.validateSecrets();
    const databaseUrlConfigured = Boolean(this.config.get('databaseUrl'));
    const redisUrlConfigured = Boolean(this.config.get('redisUrl'));
    return {
      version: APP_VERSION,
      build: getBuildMetadata(),
      configChecksum: this.getConfigChecksum(),
      secrets,
      dependencies: {
        databaseUrlConfigured,
        redisUrlConfigured,
        storageProvider: this.config.get<string>('storage.provider') ?? 'local',
        emailProvider: this.config.get<string>('email.provider') ?? 'console',
      },
      featureFlags: {
        useRealPolicies: this.config.get('featureFlags.useRealPolicies'),
        useRealTasks: this.config.get('featureFlags.useRealTasks'),
        useRealCases: this.config.get('featureFlags.useRealCases'),
        useRealKnowledge: this.config.get('featureFlags.useRealKnowledge'),
        useRealReports: this.config.get('featureFlags.useRealReports'),
        useRealNotifications: this.config.get(
          'featureFlags.useRealNotifications',
        ),
        useRealStorage: this.config.get('featureFlags.useRealStorage'),
        useRealEmail: this.config.get('featureFlags.useRealEmail'),
        useRealAudit: this.config.get('featureFlags.useRealAudit'),
        useRealSearch: this.config.get('featureFlags.useRealSearch'),
      },
      readyToServe: secrets.ok && databaseUrlConfigured && redisUrlConfigured,
    };
  }
}
