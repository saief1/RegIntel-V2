import { ConfigService } from '@nestjs/config';
import { ConfigPlatformService } from './config-platform.service';

describe('ConfigPlatformService', () => {
  it('computes checksum and validates secrets', () => {
    const config = {
      get: (key: string) => {
        const map: Record<string, unknown> = {
          nodeEnv: 'development',
          port: 3000,
          corsOrigins: ['http://localhost:5173'],
          cookieSecure: false,
          logLevel: 'info',
          allowRegister: true,
          'storage.provider': 'local',
          'email.provider': 'console',
          'search.provider': 'postgres',
          'tenant.defaultPlan': 'STARTER',
          'tenant.defaultRateLimitPerMinute': 120,
          'jwt.accessTtl': '15m',
          'jwt.refreshTtl': '7d',
          'jwt.accessSecret': 'dev-access-secret-change-me-min-32-chars!!',
          mfaEncryptionKey: 'dev-mfa-encryption-key-change-me-32b!',
          databaseUrl: 'postgresql://x',
          redisUrl: 'redis://x',
          featureFlags: { useRealEmail: false },
        };
        return map[key];
      },
    } as unknown as ConfigService;

    const service = new ConfigPlatformService(config);
    service.onModuleInit();
    const diag = service.getStartupDiagnostics();
    expect(diag.configChecksum).toHaveLength(16);
    expect(diag.version).toBe('2.5.0');
    expect(diag.secrets.warnings.length).toBeGreaterThan(0);
    expect(diag.readyToServe).toBe(true);
  });
});
