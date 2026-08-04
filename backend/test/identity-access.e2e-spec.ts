import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { AllExceptionsFilter } from '../src/common/filters/http-exception.filter';
import { ResponseInterceptor } from '../src/common/interceptors/response.interceptor';
import { generateTotp } from '../src/common/crypto/totp.util';
import { PrismaService } from '../src/common/prisma/prisma.service';
import { decryptSecret } from '../src/common/crypto/secret-box.util';

const describeDb = process.env.DATABASE_URL ? describe : describe.skip;

describeDb('Identity & access B2 (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let accessToken: string;
  let organizationId: string;
  let userId: string;

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

    const login = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: process.env.SEED_ADMIN_EMAIL ?? 'admin@regintel.local',
        password: process.env.SEED_ADMIN_PASSWORD ?? 'ChangeMeAdmin123!',
      })
      .expect(200);

    // Ensure MFA is off before suite (previous runs may leave it on).
    const email = process.env.SEED_ADMIN_EMAIL ?? 'admin@regintel.local';
    await prisma.user.update({
      where: { email: email.toLowerCase() },
      data: {
        mfaEnabled: false,
        mfaSecretEncrypted: null,
        mfaEnrolledAt: null,
      },
    });
    await prisma.mfaRecoveryCode.deleteMany({
      where: { user: { email: email.toLowerCase() } },
    });

    const cleanLogin = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email,
        password: process.env.SEED_ADMIN_PASSWORD ?? 'ChangeMeAdmin123!',
      })
      .expect(200);

    expect(cleanLogin.body.data.mfaRequired).not.toBe(true);
    accessToken = cleanLogin.body.data.accessToken as string;
    organizationId = cleanLogin.body.data.user.organizations[0].id as string;
    userId = cleanLogin.body.data.user.id as string;
    void login;
  });

  afterAll(async () => {
    await app.close();
  });

  it('lists RBAC roles/permissions/matrix and effective permissions', async () => {
    const roles = await request(app.getHttpServer())
      .get('/api/v1/rbac/roles')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
    expect(roles.body.data.length).toBeGreaterThanOrEqual(6);

    const matrix = await request(app.getHttpServer())
      .get('/api/v1/rbac/matrix')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
    expect(matrix.body.data.matrix.ORG_ADMIN).toContain('roles:manage');

    const me = await request(app.getHttpServer())
      .get('/api/v1/permissions/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .set('X-Organization-Id', organizationId)
      .expect(200);
    expect(me.body.data.permissions).toContain('roles:manage');
    expect(me.body.data.isSuperAdmin).toBe(true);

    const check = await request(app.getHttpServer())
      .get('/api/v1/permissions/check')
      .query({ permission: 'cases:read' })
      .set('Authorization', `Bearer ${accessToken}`)
      .set('X-Organization-Id', organizationId)
      .expect(200);
    expect(check.body.data.allowed).toBe(true);
  });

  it('enrolls MFA, challenges login, and verifies TOTP', async () => {
    const start = await request(app.getHttpServer())
      .post('/api/v1/mfa/enroll/start')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(201);
    expect(start.body.data.secret).toBeDefined();
    expect(start.body.data.otpauthUrl).toContain('otpauth://totp/');

    const code = generateTotp(start.body.data.secret as string);
    const confirm = await request(app.getHttpServer())
      .post('/api/v1/mfa/enroll/confirm')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ code })
      .expect(200);
    expect(confirm.body.data.enrolled).toBe(true);
    expect(confirm.body.data.recoveryCodes.length).toBeGreaterThanOrEqual(8);

    const challenged = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: process.env.SEED_ADMIN_EMAIL ?? 'admin@regintel.local',
        password: process.env.SEED_ADMIN_PASSWORD ?? 'ChangeMeAdmin123!',
      })
      .expect(200);
    expect(challenged.body.data.mfaRequired).toBe(true);
    expect(challenged.body.data.mfaChallengeToken).toBeDefined();

    const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
    const secret = decryptSecret(
      user.mfaSecretEncrypted!,
      process.env.MFA_ENCRYPTION_KEY ??
        process.env.JWT_ACCESS_SECRET ??
        'dev-mfa-encryption-key-change-me!!',
    );
    const loginCode = generateTotp(secret);
    const verified = await request(app.getHttpServer())
      .post('/api/v1/auth/mfa/verify')
      .send({
        mfaChallengeToken: challenged.body.data.mfaChallengeToken,
        code: loginCode,
      })
      .expect(200);
    expect(verified.body.data.accessToken).toBeDefined();
    accessToken = verified.body.data.accessToken as string;

    const status = await request(app.getHttpServer())
      .get('/api/v1/mfa/status')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
    expect(status.body.data.enrolled).toBe(true);

    // Disable MFA to leave seed user usable for other suites.
    const disableCode = generateTotp(secret);
    await request(app.getHttpServer())
      .post('/api/v1/mfa/disable')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ code: disableCode })
      .expect(200);
  });

  it('manages SSO mock configurations', async () => {
    const list = await request(app.getHttpServer())
      .get('/api/v1/sso/configurations')
      .set('Authorization', `Bearer ${accessToken}`)
      .set('X-Organization-Id', organizationId)
      .expect(200);
    expect(list.body.data.length).toBeGreaterThanOrEqual(1);

    const oidc = (
      list.body.data as Array<{ id: string; providerType: string }>
    ).find((row) => row.providerType === 'OIDC');
    expect(oidc).toBeDefined();

    await request(app.getHttpServer())
      .post(`/api/v1/sso/configurations/${oidc!.id}/enable`)
      .set('Authorization', `Bearer ${accessToken}`)
      .set('X-Organization-Id', organizationId)
      .expect(200);

    const authorize = await request(app.getHttpServer())
      .get(`/api/v1/sso/configurations/${oidc!.id}/authorize`)
      .set('Authorization', `Bearer ${accessToken}`)
      .set('X-Organization-Id', organizationId)
      .expect(200);
    expect(authorize.body.data.url).toContain('mock=true');

    const callback = await request(app.getHttpServer())
      .post(`/api/v1/sso/configurations/${oidc!.id}/callback`)
      .set('Authorization', `Bearer ${accessToken}`)
      .set('X-Organization-Id', organizationId)
      .send({ codeOrAssertion: 'mock:sso.user@example.com' })
      .expect(200);
    expect(callback.body.data.email).toBe('sso.user@example.com');

    await request(app.getHttpServer())
      .post(`/api/v1/sso/configurations/${oidc!.id}/disable`)
      .set('Authorization', `Bearer ${accessToken}`)
      .set('X-Organization-Id', organizationId)
      .expect(200);
  });

  it('provisions and deprovisions users via SCIM', async () => {
    const token = `scim-test-token-${Date.now()}-abcdefgh`;
    await request(app.getHttpServer())
      .put('/api/v1/scim/configuration')
      .set('Authorization', `Bearer ${accessToken}`)
      .set('X-Organization-Id', organizationId)
      .send({ enabled: true, bearerToken: token })
      .expect(200);

    const scimEmail = `scim.user.${Date.now()}@example.com`;
    const created = await request(app.getHttpServer())
      .post('/api/v1/scim/v2/Users')
      .set('Authorization', `Bearer ${token}`)
      .set('X-Organization-Id', organizationId)
      .send({
        userName: scimEmail,
        name: { formatted: 'SCIM User' },
        emails: [{ value: scimEmail, primary: true }],
        active: true,
        appRole: 'ANALYST',
      })
      .expect(201);

    const scimUserId = created.body.data.id as string;
    expect(created.body.data.active).toBe(true);

    await request(app.getHttpServer())
      .post('/api/v1/scim/v2/Groups')
      .set('Authorization', `Bearer ${token}`)
      .set('X-Organization-Id', organizationId)
      .send({
        displayName: 'Compliance Analysts',
        externalId: `group-${Date.now()}`,
        members: [created.body.data.externalId],
        mappedRole: 'ANALYST',
      })
      .expect(201);

    const status = await request(app.getHttpServer())
      .get('/api/v1/scim/status')
      .set('Authorization', `Bearer ${accessToken}`)
      .set('X-Organization-Id', organizationId)
      .expect(200);
    expect(status.body.data.configuration.enabled).toBe(true);

    await request(app.getHttpServer())
      .delete(`/api/v1/scim/v2/Users/${scimUserId}`)
      .set('Authorization', `Bearer ${token}`)
      .set('X-Organization-Id', organizationId)
      .expect(204);

    const membership = await prisma.organizationMembership.findFirst({
      where: { organizationId, userId: scimUserId },
    });
    expect(membership?.status).toBe('DISABLED');
  });
});
