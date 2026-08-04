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

describeDb('Sessions & security center v2.2.1 (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let accessToken: string;
  let userId: string;
  let refreshCookie: string;

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

    const email = process.env.SEED_ADMIN_EMAIL ?? 'admin@regintel.local';
    await prisma.user.update({
      where: { email: email.toLowerCase() },
      data: {
        mfaEnabled: false,
        mfaSecretEncrypted: null,
        mfaEnrolledAt: null,
      },
    });

    const login = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email,
        password: process.env.SEED_ADMIN_PASSWORD ?? 'ChangeMeAdmin123!',
      })
      .expect(200);

    accessToken = login.body.data.accessToken as string;
    userId = login.body.data.user.id as string;
    const setCookie = login.headers['set-cookie'] as
      string[] | string | undefined;
    const cookieHeader = Array.isArray(setCookie)
      ? setCookie.join(';')
      : setCookie;
    refreshCookie = cookieHeader ?? '';
  });

  afterAll(async () => {
    await app.close();
  });

  it('lists active sessions and policy', async () => {
    const sessions = await request(app.getHttpServer())
      .get('/api/v1/sessions')
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Cookie', refreshCookie)
      .expect(200);

    const sessionRows = sessions.body.data as Array<{ current: boolean }>;
    expect(Array.isArray(sessionRows)).toBe(true);
    expect(sessionRows.length).toBeGreaterThanOrEqual(1);
    expect(sessionRows.some((s) => s.current)).toBe(true);

    const policy = await request(app.getHttpServer())
      .get('/api/v1/sessions/policy')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
    expect(policy.body.data.idleTimeoutSeconds).toBeGreaterThan(0);
  });

  it('records login history and security events', async () => {
    const history = await request(app.getHttpServer())
      .get('/api/v1/security/login-history')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
    expect(Array.isArray(history.body.data)).toBe(true);
    expect(history.body.data.length).toBeGreaterThanOrEqual(1);

    const events = await request(app.getHttpServer())
      .get('/api/v1/security/events')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
    expect(Array.isArray(events.body.data)).toBe(true);

    const audit = await request(app.getHttpServer())
      .get('/api/v1/security/audit-trail')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
    expect(Array.isArray(audit.body.data)).toBe(true);
  });

  it('lists trusted devices (empty by default) and password history meta', async () => {
    const devices = await request(app.getHttpServer())
      .get('/api/v1/security/devices')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
    expect(Array.isArray(devices.body.data)).toBe(true);

    const pw = await request(app.getHttpServer())
      .get('/api/v1/security/password-history')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
    expect(typeof pw.body.data.count).toBe('number');
  });

  it('revokes a non-current session family when present', async () => {
    // Create a second session via another login.
    const email = process.env.SEED_ADMIN_EMAIL ?? 'admin@regintel.local';
    const second = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email,
        password: process.env.SEED_ADMIN_PASSWORD ?? 'ChangeMeAdmin123!',
      })
      .expect(200);
    const secondToken = second.body.data.accessToken as string;

    const listed = await request(app.getHttpServer())
      .get('/api/v1/sessions')
      .set('Authorization', `Bearer ${secondToken}`)
      .expect(200);

    const other = (
      listed.body.data as Array<{ id: string; current: boolean }>
    ).find((s) => !s.current);
    if (other) {
      await request(app.getHttpServer())
        .delete(`/api/v1/sessions/${other.id}`)
        .set('Authorization', `Bearer ${secondToken}`)
        .expect(204);
    }

    expect(userId).toBeTruthy();
  });

  it('logout-everywhere revokes refresh families', async () => {
    const email = process.env.SEED_ADMIN_EMAIL ?? 'admin@regintel.local';
    await prisma.user.update({
      where: { email: email.toLowerCase() },
      data: {
        mfaEnabled: false,
        mfaSecretEncrypted: null,
        mfaEnrolledAt: null,
      },
    });
    const login = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email,
        password: process.env.SEED_ADMIN_PASSWORD ?? 'ChangeMeAdmin123!',
      })
      .expect(200);
    expect(login.body.data.mfaRequired).not.toBe(true);
    const token = login.body.data.accessToken as string;
    expect(typeof token).toBe('string');

    const result = await request(app.getHttpServer())
      .post('/api/v1/sessions/logout-everywhere')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(result.body.data.revoked).toBeGreaterThanOrEqual(1);
  });
});
