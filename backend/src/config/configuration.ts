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
  email: {
    provider: string;
    fromAddress: string;
    fromName: string;
    smtpHost: string;
    smtpPort: number;
    smtpUser: string;
    smtpPass: string;
    smtpSecure: boolean;
    resendApiKey: string;
    sendgridApiKey: string;
    sesRegion: string;
  };
  audit: {
    retentionDays: number;
  };
  search: {
    provider: string;
  };
  ai: {
    provider: string;
    vectorStore: string;
    timeoutMs: number;
    maxRetries: number;
    historyTokenBudget: number;
    chatModel: string;
    embeddingModel: string;
    openaiApiKey: string;
    openaiBaseUrl: string;
    azureOpenAiApiKey: string;
    azureOpenAiEndpoint: string;
    anthropicApiKey: string;
    geminiApiKey: string;
  };
  tenant: {
    defaultPlan: string;
    defaultRateLimitPerMinute: number;
  };
  globalRateLimitPerMinute: number;
  featureFlags: {
    useRealPolicies: boolean;
    useRealTasks: boolean;
    useRealCases: boolean;
    useRealKnowledge: boolean;
    useRealReports: boolean;
    useRealNotifications: boolean;
    useRealStorage: boolean;
    useRealEmail: boolean;
    useRealAudit: boolean;
    useRealSearch: boolean;
    useRealAi: boolean;
    useRag: boolean;
    useVectorSearch: boolean;
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
  email: {
    provider: process.env.EMAIL_PROVIDER ?? 'console',
    fromAddress: process.env.EMAIL_FROM_ADDRESS ?? 'noreply@regintel.local',
    fromName: process.env.EMAIL_FROM_NAME ?? 'RegIntel',
    smtpHost: process.env.SMTP_HOST ?? 'localhost',
    smtpPort: Number(process.env.SMTP_PORT ?? 1025),
    smtpUser: process.env.SMTP_USER ?? '',
    smtpPass: process.env.SMTP_PASS ?? '',
    smtpSecure: (process.env.SMTP_SECURE ?? 'false') === 'true',
    resendApiKey: process.env.RESEND_API_KEY ?? '',
    sendgridApiKey: process.env.SENDGRID_API_KEY ?? '',
    sesRegion: process.env.AWS_SES_REGION ?? 'us-east-1',
  },
  audit: {
    retentionDays: Number(process.env.AUDIT_RETENTION_DAYS ?? 365),
  },
  search: {
    provider: process.env.SEARCH_PROVIDER ?? 'postgres',
  },
  ai: {
    provider: process.env.AI_PROVIDER ?? 'mock',
    vectorStore: process.env.VECTOR_STORE ?? 'pgvector',
    timeoutMs: Number(process.env.AI_TIMEOUT_MS ?? 30000),
    maxRetries: Number(process.env.AI_MAX_RETRIES ?? 2),
    historyTokenBudget: Number(process.env.AI_HISTORY_TOKEN_BUDGET ?? 2500),
    chatModel: process.env.AI_CHAT_MODEL ?? 'gpt-4o-mini',
    embeddingModel: process.env.AI_EMBEDDING_MODEL ?? 'text-embedding-3-small',
    openaiApiKey: process.env.OPENAI_API_KEY ?? '',
    openaiBaseUrl: process.env.OPENAI_BASE_URL ?? 'https://api.openai.com/v1',
    azureOpenAiApiKey: process.env.AZURE_OPENAI_API_KEY ?? '',
    azureOpenAiEndpoint: process.env.AZURE_OPENAI_ENDPOINT ?? '',
    anthropicApiKey: process.env.ANTHROPIC_API_KEY ?? '',
    geminiApiKey: process.env.GOOGLE_GEMINI_API_KEY ?? '',
  },
  tenant: {
    defaultPlan: process.env.TENANT_DEFAULT_PLAN ?? 'STARTER',
    defaultRateLimitPerMinute: Number(
      process.env.TENANT_RATE_LIMIT_PER_MINUTE ?? 120,
    ),
  },
  globalRateLimitPerMinute: Number(
    process.env.GLOBAL_RATE_LIMIT_PER_MINUTE ?? 300,
  ),
  featureFlags: {
    useRealPolicies: flag('USE_REAL_POLICIES'),
    useRealTasks: flag('USE_REAL_TASKS'),
    useRealCases: flag('USE_REAL_CASES'),
    useRealKnowledge: flag('USE_REAL_KNOWLEDGE'),
    useRealReports: flag('USE_REAL_REPORTS'),
    useRealNotifications: flag('USE_REAL_NOTIFICATIONS'),
    useRealStorage: flag('USE_REAL_STORAGE'),
    useRealEmail: flag('USE_REAL_EMAIL'),
    useRealAudit: flag('USE_REAL_AUDIT'),
    useRealSearch: flag('USE_REAL_SEARCH'),
    useRealAi: flag('USE_REAL_AI'),
    useRag: flag('USE_RAG'),
    useVectorSearch: flag('USE_VECTOR_SEARCH'),
  },
});
