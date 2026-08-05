import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { AllExceptionsFilter } from '../src/common/filters/http-exception.filter';
import { ResponseInterceptor } from '../src/common/interceptors/response.interceptor';
import { securityHeadersMiddleware } from '../src/common/security/security-headers.middleware';

const describeIfDb = process.env.DATABASE_URL ? describe : describe.skip;

describeIfDb('Backend GA B5 (e2e)', () => {
  let app: INestApplication<App>;
  let accessToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.use(securityHeadersMiddleware);
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    app.useGlobalFilters(new AllExceptionsFilter());
    app.useGlobalInterceptors(new ResponseInterceptor());
    await app.init();

    const email = process.env.SEED_ADMIN_EMAIL ?? 'admin@regintel.local';
    const password = process.env.SEED_ADMIN_PASSWORD ?? 'ChangeMeAdmin123!';
    const login = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email, password });
    expect([200, 201]).toContain(login.status);
    accessToken = login.body.data.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  it('exposes version and deployment metadata', async () => {
    const version = await request(app.getHttpServer()).get(
      '/api/v1/ops/version',
    );
    expect(version.status).toBe(200);
    expect(version.body.data.version).toBe('2.6.0');

    const deployment = await request(app.getHttpServer()).get(
      '/api/v1/ops/deployment',
    );
    expect(deployment.status).toBe(200);
    expect(deployment.body.data.configChecksum).toBeDefined();
    expect(deployment.body.data.build).toBeDefined();
  });

  it('exposes observability dashboard and errors', async () => {
    const dash = await request(app.getHttpServer()).get(
      '/api/v1/ops/dashboard',
    );
    expect(dash.status).toBe(200);
    expect(dash.body.data.version).toBe('2.6.0');
    expect(dash.body.data.errors).toBeDefined();

    const errors = await request(app.getHttpServer()).get('/api/v1/ops/errors');
    expect(errors.status).toBe(200);
    expect(typeof errors.body.data.total).toBe('number');
  });

  it('sets security headers', async () => {
    const res = await request(app.getHttpServer()).get('/api/v1/liveness');
    expect(res.status).toBe(200);
    expect(res.headers['x-content-type-options']).toBe('nosniff');
    expect(res.headers['x-frame-options']).toBe('DENY');
    expect(res.headers['referrer-policy']).toBe('no-referrer');
  });

  it('security hardening audit', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/security/hardening')
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.controls.length).toBeGreaterThanOrEqual(8);
    expect(['hardened', 'needs_attention']).toContain(res.body.data.overall);
  });

  it('propagates correlation id', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/liveness')
      .set('X-Correlation-Id', 'corr-test-123');
    expect(res.status).toBe(200);
    expect(res.headers['x-correlation-id']).toBe('corr-test-123');
    expect(res.headers['x-request-id']).toBeDefined();
  });
});
