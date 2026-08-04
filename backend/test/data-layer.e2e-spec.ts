import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { AllExceptionsFilter } from '../src/common/filters/http-exception.filter';
import { ResponseInterceptor } from '../src/common/interceptors/response.interceptor';

const describeIfDb = process.env.DATABASE_URL ? describe : describe.skip;

describeIfDb('Data layer & notifications (e2e)', () => {
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

  it('health reports database and storage provider', async () => {
    const res = await request(app.getHttpServer()).get('/api/v1/health');
    expect(res.status).toBe(200);
    expect(res.body.data.database).toBe('up');
    expect(res.body.data.storageProvider).toBeDefined();
  });

  it('CRUD policy via repository-backed API', async () => {
    const created = await request(app.getHttpServer())
      .post('/api/v1/policies')
      .set('Authorization', `Bearer ${accessToken}`)
      .set('X-Organization-Id', organizationId)
      .send({ title: 'E2E Policy', description: 'from e2e' });

    expect([200, 201]).toContain(created.status);
    const id = created.body.data.id as string;

    const listed = await request(app.getHttpServer())
      .get('/api/v1/policies')
      .set('Authorization', `Bearer ${accessToken}`)
      .set('X-Organization-Id', organizationId);
    expect(listed.status).toBe(200);
    expect(Array.isArray(listed.body.data)).toBe(true);

    const deleted = await request(app.getHttpServer())
      .delete(`/api/v1/policies/${id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .set('X-Organization-Id', organizationId);
    expect(deleted.status).toBe(200);
    expect(deleted.body.data.deleted).toBe(true);
  });

  it('lists and marks notifications read', async () => {
    const listed = await request(app.getHttpServer())
      .get('/api/v1/notifications')
      .set('Authorization', `Bearer ${accessToken}`)
      .set('X-Organization-Id', organizationId);
    expect(listed.status).toBe(200);
    expect(Array.isArray(listed.body.data)).toBe(true);

    const markAll = await request(app.getHttpServer())
      .post('/api/v1/notifications/read-all')
      .set('Authorization', `Bearer ${accessToken}`)
      .set('X-Organization-Id', organizationId);
    expect([200, 201]).toContain(markAll.status);
    expect(typeof markAll.body.data.updated).toBe('number');
  });

  it('returns job monitoring stats', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/jobs/stats')
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.queues.length).toBeGreaterThanOrEqual(1);
  });

  it('uploads a file to local storage', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/storage/upload')
      .set('Authorization', `Bearer ${accessToken}`)
      .set('X-Organization-Id', organizationId)
      .attach('file', Buffer.from('e2e-storage'), {
        filename: 'e2e.txt',
        contentType: 'text/plain',
      });

    expect([200, 201]).toContain(res.status);
    expect(res.body.data.object.filename).toBe('e2e.txt');
    expect(res.body.data.object.provider).toBe('LOCAL');
  });
});
