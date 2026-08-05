/**
 * Bootstraps Nest just long enough to emit OpenAPI JSON (no listen).
 */
const { NestFactory } = require('@nestjs/core');
const { DocumentBuilder, SwaggerModule } = require('@nestjs/swagger');

async function main() {
  const { AppModule } = require('../dist/app.module');
  const { APP_VERSION } = require('../dist/config/version');

  const app = await NestFactory.create(AppModule, {
    logger: false,
    abortOnError: false,
  });
  app.setGlobalPrefix('api/v1');
  const swaggerConfig = new DocumentBuilder()
    .setTitle('RegIntel API')
    .setDescription('Generated for CI OpenAPI verification')
    .setVersion(APP_VERSION)
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  const paths = Object.keys(document.paths ?? {});
  process.stdout.write(
    `${JSON.stringify({ paths, document })}\n`,
  );
  await app.close();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
