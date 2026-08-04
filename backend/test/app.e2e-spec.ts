import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { AllExceptionsFilter } from '../src/common/filters/http-exception.filter';
import { ResponseInterceptor } from '../src/common/interceptors/response.interceptor';
import { PrismaService } from '../src/common/prisma/prisma.service';

const describeDb = process.env.DATABASE_URL ? describe : describe.skip;

describeDb('Auth + tenancy (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.use(cookieParser());
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
    prisma = app.get(PrismaService);
  });

  afterAll(async () => {
    await app.close();
  });

  it('logs in seed admin and rejects cross-tenant org access', async () => {
    const login = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: process.env.SEED_ADMIN_EMAIL ?? 'admin@regintel.local',
        password: process.env.SEED_ADMIN_PASSWORD ?? 'ChangeMeAdmin123!',
      })
      .expect(200);

    expect(login.body.success).toBe(true);
    expect(login.body.data.accessToken).toBeDefined();
    const token = login.body.data.accessToken as string;
    const orgId = login.body.data.user.organizations[0].id as string;

    const me = await request(app.getHttpServer())
      .get('/api/v1/users/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(me.body.data.email).toContain('@');

    const ok = await request(app.getHttpServer())
      .get(`/api/v1/organizations/${orgId}`)
      .set('Authorization', `Bearer ${token}`)
      .set('X-Organization-Id', orgId)
      .expect(200);
    expect(ok.body.data.id).toBe(orgId);

    const foreignOrg = await prisma.organization.create({
      data: {
        name: 'Foreign Org',
        slug: `foreign-${Date.now()}`,
      },
    });

    const denied = await request(app.getHttpServer())
      .get(`/api/v1/organizations/${foreignOrg.id}`)
      .set('Authorization', `Bearer ${token}`)
      .set('X-Organization-Id', foreignOrg.id)
      .expect(403);

    expect(denied.body).toMatchObject({
      success: false,
      error: {
        code: 'ORG_ACCESS_DENIED',
      },
    });
    expect(denied.body.error.requestId).toBeDefined();
  });

  it('health returns success envelope', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/health')
      .expect(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBeDefined();
  });
});
