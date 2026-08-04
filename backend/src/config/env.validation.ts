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
  @IsNotEmpty()
  REDIS_URL!: string;

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
