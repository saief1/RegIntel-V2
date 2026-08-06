import { plainToInstance } from 'class-transformer';
import {
  IsBooleanString,
  IsNotEmpty,
  IsOptional,
  IsString,
  validateSync,
} from 'class-validator';

class EnvironmentVariables {
  @IsString()
  @IsNotEmpty()
  NODE_ENV!: string;

  @IsString()
  @IsOptional()
  PORT?: string;

  @IsString()
  @IsNotEmpty()
  DATABASE_URL!: string;

  @IsString()
  @IsOptional()
  DIRECT_URL?: string;

  @IsString()
  @IsNotEmpty()
  REDIS_URL!: string;

  @IsString()
  @IsOptional()
  STORAGE_PROVIDER?: string;

  @IsString()
  @IsOptional()
  STORAGE_LOCAL_ROOT?: string;

  @IsString()
  @IsOptional()
  EMAIL_PROVIDER?: string;

  @IsString()
  @IsOptional()
  EMAIL_FROM_ADDRESS?: string;

  @IsString()
  @IsOptional()
  SMTP_HOST?: string;

  @IsString()
  @IsOptional()
  SMTP_PORT?: string;

  @IsString()
  @IsOptional()
  RESEND_API_KEY?: string;

  @IsString()
  @IsOptional()
  SENDGRID_API_KEY?: string;

  @IsString()
  @IsOptional()
  AWS_SES_REGION?: string;

  @IsString()
  @IsOptional()
  AUDIT_RETENTION_DAYS?: string;

  @IsString()
  @IsOptional()
  SEARCH_PROVIDER?: string;

  @IsString()
  @IsOptional()
  TENANT_DEFAULT_PLAN?: string;

  @IsString()
  @IsOptional()
  TENANT_RATE_LIMIT_PER_MINUTE?: string;

  @IsBooleanString()
  @IsOptional()
  USE_REAL_POLICIES?: string;

  @IsBooleanString()
  @IsOptional()
  USE_REAL_TASKS?: string;

  @IsBooleanString()
  @IsOptional()
  USE_REAL_CASES?: string;

  @IsBooleanString()
  @IsOptional()
  USE_REAL_KNOWLEDGE?: string;

  @IsBooleanString()
  @IsOptional()
  USE_REAL_REPORTS?: string;

  @IsBooleanString()
  @IsOptional()
  USE_REAL_NOTIFICATIONS?: string;

  @IsBooleanString()
  @IsOptional()
  USE_REAL_STORAGE?: string;

  @IsBooleanString()
  @IsOptional()
  USE_REAL_EMAIL?: string;

  @IsBooleanString()
  @IsOptional()
  USE_REAL_AUDIT?: string;

  @IsBooleanString()
  @IsOptional()
  USE_REAL_SEARCH?: string;

  @IsBooleanString()
  @IsOptional()
  USE_REAL_AI?: string;

  @IsBooleanString()
  @IsOptional()
  USE_RAG?: string;

  @IsBooleanString()
  @IsOptional()
  USE_VECTOR_SEARCH?: string;

  @IsString()
  @IsOptional()
  AI_PROVIDER?: string;

  @IsString()
  @IsOptional()
  VECTOR_STORE?: string;

  @IsString()
  @IsOptional()
  OPENAI_API_KEY?: string;

  @IsString()
  @IsOptional()
  OPENAI_BASE_URL?: string;

  @IsString()
  @IsOptional()
  AZURE_OPENAI_API_KEY?: string;

  @IsString()
  @IsOptional()
  AZURE_OPENAI_ENDPOINT?: string;

  @IsString()
  @IsOptional()
  ANTHROPIC_API_KEY?: string;

  @IsString()
  @IsOptional()
  GOOGLE_GEMINI_API_KEY?: string;

  @IsString()
  @IsOptional()
  AI_TIMEOUT_MS?: string;

  @IsString()
  @IsOptional()
  AI_MAX_RETRIES?: string;

  @IsString()
  @IsNotEmpty()
  JWT_ACCESS_SECRET!: string;

  @IsString()
  @IsNotEmpty()
  JWT_ACCESS_TTL!: string;

  @IsString()
  @IsNotEmpty()
  JWT_REFRESH_TTL!: string;

  @IsString()
  @IsOptional()
  REFRESH_COOKIE_NAME?: string;

  @IsString()
  @IsNotEmpty()
  CORS_ORIGINS!: string;

  @IsBooleanString()
  @IsOptional()
  COOKIE_SECURE?: string;

  @IsString()
  @IsOptional()
  LOG_LEVEL?: string;

  @IsBooleanString()
  @IsOptional()
  ALLOW_REGISTER?: string;

  @IsString()
  @IsOptional()
  MFA_ENCRYPTION_KEY?: string;

  @IsString()
  @IsOptional()
  SESSION_IDLE_TIMEOUT?: string;

  @IsString()
  @IsOptional()
  MFA_TRUSTED_DEVICE_TTL?: string;

  @IsString()
  @IsOptional()
  MFA_TRUSTED_DEVICE_COOKIE_NAME?: string;
}

export function validateEnv(config: Record<string, unknown>) {
  const validated = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validated, { skipMissingProperties: false });
  if (errors.length > 0) {
    const messages = errors
      .map((error) => Object.values(error.constraints ?? {}).join(', '))
      .join('; ');
    throw new Error(`Invalid environment configuration: ${messages}`);
  }
  return validated;
}
