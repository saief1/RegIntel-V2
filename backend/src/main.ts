import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { structuredLog } from './common/logging/structured-logger';
import { securityHeadersMiddleware } from './common/security/security-headers.middleware';
import { AppConfig } from './config/configuration';
import { APP_VERSION, getBuildMetadata } from './config/version';

function startupValidation(configService: ConfigService): void {
  const required = ['databaseUrl', 'redisUrl', 'jwt.accessSecret'] as const;
  for (const key of required) {
    const value = configService.get<string>(key);
    if (!value) {
      throw new Error(`Startup validation failed: missing config ${key}`);
    }
  }
  if ((configService.get<string>('jwt.accessSecret') ?? '').length < 16) {
    throw new Error(
      'Startup validation failed: JWT_ACCESS_SECRET must be at least 16 characters',
    );
  }
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });
  const configService = app.get(ConfigService);
  startupValidation(configService);

  const port = configService.getOrThrow<number>('port');
  const corsOrigins = configService.getOrThrow<string[]>('corsOrigins');
  const build = getBuildMetadata();

  app.setGlobalPrefix('api/v1');
  app.use(cookieParser());
  app.use(securityHeadersMiddleware);
  app.enableCors({
    origin: corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Authorization',
      'Content-Type',
      'X-Organization-Id',
      'X-Request-Id',
      'X-Correlation-Id',
    ],
    exposedHeaders: [
      'X-Request-Id',
      'X-Correlation-Id',
      'X-Response-Time-Ms',
      'X-RateLimit-Remaining',
      'X-RateLimit-Reset',
      'X-Global-RateLimit-Remaining',
    ],
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(new ResponseInterceptor());
  app.enableShutdownHooks();

  const swaggerConfig = new DocumentBuilder()
    .setTitle('RegIntel API')
    .setDescription(
      'RegIntel API (Milestone C1 / v2.6.0 AI Foundation). AI gateway, providers, embeddings, and vector search behind USE_REAL_AI. JWT Bearer; httpOnly refresh cookies; X-Organization-Id tenancy.',
    )
    .setVersion(APP_VERSION)
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(port);
  const nodeEnv = configService.getOrThrow<AppConfig['nodeEnv']>('nodeEnv');

  structuredLog('info', `RegIntel API listening on port ${port}`, {
    nodeEnv,
    swagger: '/api/docs',
    version: APP_VERSION,
    gitSha: build.gitSha,
    deploymentId: build.deploymentId,
  });

  const shutdown = async (signal: string) => {
    structuredLog('info', 'Graceful shutdown started', { signal });
    const forceTimer = setTimeout(() => {
      structuredLog('error', 'Graceful shutdown timed out; forcing exit', {
        signal,
      });
      process.exit(1);
    }, 25_000);
    try {
      await app.close();
      structuredLog('info', 'Graceful shutdown complete', { signal });
      clearTimeout(forceTimer);
      process.exit(0);
    } catch (error) {
      structuredLog('error', 'Graceful shutdown failed', {
        signal,
        error: error instanceof Error ? error.message : String(error),
      });
      clearTimeout(forceTimer);
      process.exit(1);
    }
  };
  process.on('SIGTERM', () => void shutdown('SIGTERM'));
  process.on('SIGINT', () => void shutdown('SIGINT'));
}

void bootstrap();
