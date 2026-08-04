export type AppConfig = {
  nodeEnv: string;
  port: number;
  databaseUrl: string;
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
};

export default (): AppConfig => ({
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 3000),
  databaseUrl: process.env.DATABASE_URL ?? '',
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
});
