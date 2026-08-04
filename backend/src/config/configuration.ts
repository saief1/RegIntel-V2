export type AppConfig = {
  nodeEnv: string;
  port: number;
  databaseUrl: string;
  directUrl: string;
  redisUrl: string;
  jwt: {
    accessSecret: string;
    accessTtl: string;
    refreshTtl: string;
  };
  refreshCookieName: string;
  corsOrigins: string[];
  cookieSecure: boolean;
  logLevel: string;
  allowRegister: boolean;
  /** AES key material for MFA secrets / SSO client secrets at rest. */
  mfaEncryptionKey: string;
  /** Idle timeout for refresh sessions (e.g. 30m). */
  sessionIdleTimeout: string;
  /** MFA remember-browser cookie TTL (e.g. 30d). */
  mfaTrustedDeviceTtl: string;
  mfaTrustedDeviceCookieName: string;
  /** How many prior password hashes to reject on change. */
  passwordHistoryLimit: number;
  /** Failed logins in window before suspicious event. */
  failedLoginThreshold: number;
  failedLoginWindowMinutes: number;
  storage: {
    provider: string;
    localRoot: string;
  };
  featureFlags: {
    useRealPolicies: boolean;
    useRealTasks: boolean;
    useRealCases: boolean;
    useRealKnowledge: boolean;
    useRealReports: boolean;
    useRealNotifications: boolean;
    useRealStorage: boolean;
  };
};

const flag = (name: string, fallback = false): boolean =>
  (process.env[name] ?? String(fallback)) === 'true';

export default (): AppConfig => ({
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 3000),
  databaseUrl: process.env.DATABASE_URL ?? '',
  directUrl: process.env.DIRECT_URL || process.env.DATABASE_URL || '',
  redisUrl: process.env.REDIS_URL ?? '',
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET ?? '',
    accessTtl: process.env.JWT_ACCESS_TTL ?? '15m',
    refreshTtl: process.env.JWT_REFRESH_TTL ?? '7d',
  },
  refreshCookieName: process.env.REFRESH_COOKIE_NAME ?? 'refresh_token',
  corsOrigins: (process.env.CORS_ORIGINS ?? 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
  cookieSecure: (process.env.COOKIE_SECURE ?? 'false') === 'true',
  logLevel: process.env.LOG_LEVEL ?? 'info',
  allowRegister: (process.env.ALLOW_REGISTER ?? 'false') === 'true',
  mfaEncryptionKey:
    process.env.MFA_ENCRYPTION_KEY ??
    process.env.JWT_ACCESS_SECRET ??
    'dev-mfa-encryption-key-change-me!!',
  sessionIdleTimeout: process.env.SESSION_IDLE_TIMEOUT ?? '30m',
  mfaTrustedDeviceTtl: process.env.MFA_TRUSTED_DEVICE_TTL ?? '30d',
  mfaTrustedDeviceCookieName:
    process.env.MFA_TRUSTED_DEVICE_COOKIE_NAME ?? 'mfa_trusted_device',
  passwordHistoryLimit: Number(process.env.PASSWORD_HISTORY_LIMIT ?? 5),
  failedLoginThreshold: Number(process.env.FAILED_LOGIN_THRESHOLD ?? 5),
  failedLoginWindowMinutes: Number(
    process.env.FAILED_LOGIN_WINDOW_MINUTES ?? 15,
  ),
  storage: {
    provider: process.env.STORAGE_PROVIDER ?? 'local',
    localRoot: process.env.STORAGE_LOCAL_ROOT ?? './storage',
  },
  featureFlags: {
    useRealPolicies: flag('USE_REAL_POLICIES'),
    useRealTasks: flag('USE_REAL_TASKS'),
    useRealCases: flag('USE_REAL_CASES'),
    useRealKnowledge: flag('USE_REAL_KNOWLEDGE'),
    useRealReports: flag('USE_REAL_REPORTS'),
    useRealNotifications: flag('USE_REAL_NOTIFICATIONS'),
    useRealStorage: flag('USE_REAL_STORAGE'),
  },
});
