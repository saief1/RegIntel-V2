import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { AppConfig } from './config/configuration';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
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

  const swaggerConfig = new DocumentBuilder()
    .setTitle('RegIntel API')
    .setDescription(
      'RegIntel API (Milestone B3 / v2.3.0). Identity, domain CRUD (policies/tasks/cases/knowledge/reports/workflows), notifications, local object storage, BullMQ jobs. JWT Bearer; httpOnly refresh cookies; X-Organization-Id tenancy.',
    )
    .setVersion('2.3.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(port);
  const nodeEnv = configService.getOrThrow<AppConfig['nodeEnv']>('nodeEnv');

  console.log(
    JSON.stringify({
      level: 'info',
      message: `RegIntel API listening on port ${port}`,
      nodeEnv,
      swagger: '/api/docs',
    }),
  );
}

void bootstrap();
