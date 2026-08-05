import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { AllExceptionsFilter } from '../src/common/filters/http-exception.filter';
import { ResponseInterceptor } from '../src/common/interceptors/response.interceptor';

const describeIfDb = process.env.DATABASE_URL ? describe : describe.skip;

describeIfDb('Infrastructure B4 (e2e)', () => {
  let app: INestApplication<App>;
  let accessToken: string;
  let organizationId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
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
    organizationId = login.body.data.user.organizations[0].id;
  });

  afterAll(async () => {
    await app.close();
  });

  it('liveness and readiness probes', async () => {
    const live = await request(app.getHttpServer()).get('/api/v1/liveness');
    expect(live.status).toBe(200);
    expect(live.body.data.status).toBe('ok');

    const ready = await request(app.getHttpServer()).get('/api/v1/readiness');
    expect(ready.status).toBe(200);
    expect(['ready', 'not_ready']).toContain(ready.body.data.status);
    expect(ready.body.data.checks.database).toBeDefined();
  });

  it('health includes email and version', async () => {
    const res = await request(app.getHttpServer()).get('/api/v1/health');
    expect(res.status).toBe(200);
    expect(res.body.data.version).toBe('2.5.0');
    expect(res.body.data.emailProvider).toBeDefined();
  });

  it('prometheus metrics endpoint', async () => {
    const res = await request(app.getHttpServer()).get('/api/v1/metrics');
    expect(res.status).toBe(200);
    expect(res.text).toContain('process_uptime_seconds');
  });

  it('email templates list', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/email/templates')
      .set('Authorization', `Bearer ${accessToken}`)
      .set('X-Organization-Id', organizationId);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(10);
  });

  it('queues templated console email', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/email/send')
      .set('Authorization', `Bearer ${accessToken}`)
      .set('X-Organization-Id', organizationId)
      .send({
        to: 'ops@regintel.local',
        templateKey: 'welcome',
        variables: { name: 'Ops', orgName: 'Demo' },
      });
    expect([200, 201]).toContain(res.status);
    expect(res.body.data.queued).toBe(true);
  });

  it('audit logs list and retention', async () => {
    const logs = await request(app.getHttpServer())
      .get('/api/v1/audit-entries/logs')
      .set('Authorization', `Bearer ${accessToken}`)
      .set('X-Organization-Id', organizationId);
    expect(logs.status).toBe(200);
    expect(Array.isArray(logs.body.data)).toBe(true);

    const retention = await request(app.getHttpServer())
      .get('/api/v1/audit-entries/retention')
      .set('Authorization', `Bearer ${accessToken}`)
      .set('X-Organization-Id', organizationId);
    expect(retention.status).toBe(200);
    expect(retention.body.data.immutable).toBe(true);
  });

  it('search rebuild and query', async () => {
    const rebuild = await request(app.getHttpServer())
      .post('/api/v1/search/rebuild/sync')
      .set('Authorization', `Bearer ${accessToken}`)
      .set('X-Organization-Id', organizationId);
    expect([200, 201]).toContain(rebuild.status);

    const search = await request(app.getHttpServer())
      .get('/api/v1/search')
      .query({ q: 'a', page: 1, pageSize: 10 })
      .set('Authorization', `Bearer ${accessToken}`)
      .set('X-Organization-Id', organizationId);
    expect(search.status).toBe(200);
    expect(Array.isArray(search.body.data)).toBe(true);
  });

  it('tenancy context isolates quotas', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/tenancy/context')
      .set('Authorization', `Bearer ${accessToken}`)
      .set('X-Organization-Id', organizationId);
    expect(res.status).toBe(200);
    expect(res.body.data.organizationId).toBe(organizationId);
    expect(res.body.data.limits.maxSeats).toBeGreaterThan(0);
  });

  it('denies audit logs for foreign organization id', async () => {
    const foreign = '00000000-0000-4000-8000-000000000099';
    const res = await request(app.getHttpServer())
      .get('/api/v1/audit-entries/logs')
      .set('Authorization', `Bearer ${accessToken}`)
      .set('X-Organization-Id', foreign);
    expect(res.status).toBe(403);
  });
});
