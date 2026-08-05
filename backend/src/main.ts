import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { structuredLog } from './common/logging/structured-logger';
import { AppConfig } from './config/configuration';

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

  app.setGlobalPrefix('api/v1');
  app.use(cookieParser());
  app.enableCors({
    origin: corsOrigins,
    credentials: true,
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
      'RegIntel API (Milestone B4 / v2.4.0). Infrastructure & production readiness: email, immutable audit, search, multi-tenancy, ops probes. JWT Bearer; httpOnly refresh cookies; X-Organization-Id tenancy.',
    )
    .setVersion('2.4.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(port);
  const nodeEnv = configService.getOrThrow<AppConfig['nodeEnv']>('nodeEnv');

  structuredLog('info', `RegIntel API listening on port ${port}`, {
    nodeEnv,
    swagger: '/api/docs',
    version: '2.4.0',
  });

  const shutdown = async (signal: string) => {
    structuredLog('info', 'Graceful shutdown started', { signal });
    await app.close();
    structuredLog('info', 'Graceful shutdown complete', { signal });
    process.exit(0);
  };
  process.on('SIGTERM', () => void shutdown('SIGTERM'));
  process.on('SIGINT', () => void shutdown('SIGINT'));
}

void bootstrap();
