import {
  ConflictException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { createHash, randomBytes, randomUUID } from 'crypto';
import { Request, Response } from 'express';
import { AuditService } from '../../common/audit/audit.service';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AppConfig } from '../../config/configuration';
import {
  AuthMfaChallengeResponse,
  AuthTokenResponse,
  AuthUserView,
  JwtPayload,
} from './auth.types';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { PasswordService } from './password.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly passwordService: PasswordService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly auditService: AuditService,
  ) {}

  async register(
    dto: RegisterDto,
    req: Request,
    res: Response,
  ): Promise<AuthTokenResponse> {
    const allowRegister =
      this.configService.getOrThrow<boolean>('allowRegister');
    if (!allowRegister) {
      throw new ForbiddenException({
        code: 'AUTH_REGISTER_DISABLED',
        message: 'Registration is disabled in this environment.',
      });
    }

    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });
    if (existing) {
      throw new ConflictException({
        code: 'AUTH_EMAIL_EXISTS',
        message: 'An account with this email already exists.',
      });
    }

    const passwordHash = await this.passwordService.hash(dto.password);
    const orgName =
      dto.organizationName?.trim() || `${dto.name}'s Organization`;
    const slugBase = orgName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 48);
    const slug = `${slugBase || 'org'}-${randomBytes(3).toString('hex')}`;

    const user = await this.prisma.$transaction(async (tx) => {
      const createdUser = await tx.user.create({
        data: {
          email: dto.email.toLowerCase(),
          passwordHash,
          name: dto.name,
        },
      });
      const org = await tx.organization.create({
        data: { name: orgName, slug },
      });
      await tx.organizationMembership.create({
        data: {
          userId: createdUser.id,
          organizationId: org.id,
          role: 'OWNER',
          appRole: 'ORG_ADMIN',
          status: 'ACTIVE',
        },
      });
      await tx.passwordHistory.create({
        data: { userId: createdUser.id, passwordHash },
      });
      return createdUser;
    });

    await this.auditService.record({
      action: 'auth.register',
      resource: `user:${user.id}`,
      userId: user.id,
      request: req,
    });

    return this.issueSessionForUser(user.id, req, res);
  }

  async login(
    dto: LoginDto,
    req: Request,
    res: Response,
  ): Promise<AuthTokenResponse | AuthMfaChallengeResponse> {
    const email = dto.email.toLowerCase();
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    const valid =
      !!user &&
      (await this.passwordService.verify(user.passwordHash, dto.password));

    if (!user || !valid || !user.active) {
      await this.recordLoginAttempt({
        userId: user?.id ?? null,
        email,
        result: 'FAILURE',
        reason: !user
          ? 'unknown_user'
          : !user.active
            ? 'inactive'
            : 'bad_password',
        req,
      });
      await this.auditService.record({
        action: 'auth.login_failed',
        resource: `email:${email}`,
        userId: user?.id ?? null,
        request: req,
      });
      if (user?.id) {
        await this.maybeFlagSuspiciousFailures(user.id, email, req);
      }
      throw new UnauthorizedException({
        code: 'AUTH_INVALID_CREDENTIALS',
        message: 'Email or password is incorrect.',
      });
    }

    if (user.mfaEnabled) {
      const trusted = await this.findValidTrustedDevice(user.id, req);
      if (trusted) {
        await this.recordLoginAttempt({
          userId: user.id,
          email,
          result: 'SUCCESS',
          reason: 'trusted_device',
          req,
        });
        await this.auditService.record({
          action: 'auth.login',
          resource: `user:${user.id}`,
          userId: user.id,
          after: { via: 'trusted_device' },
          request: req,
        });
        return this.issueSessionForUser(user.id, req, res, trusted.id);
      }

      const jwt = this.configService.getOrThrow<AppConfig['jwt']>('jwt');
      const mfaChallengeToken = await this.jwtService.signAsync(
        { sub: user.id, purpose: 'mfa_challenge' },
        {
          secret: jwt.accessSecret,
          expiresIn: '5m',
        },
      );
      await this.recordLoginAttempt({
        userId: user.id,
        email,
        result: 'MFA_REQUIRED',
        req,
      });
      await this.auditService.record({
        action: 'auth.login_mfa_required',
        resource: `user:${user.id}`,
        userId: user.id,
        request: req,
      });
      return {
        mfaRequired: true as const,
        mfaChallengeToken,
      };
    }

    await this.recordLoginAttempt({
      userId: user.id,
      email,
      result: 'SUCCESS',
      req,
    });
    await this.auditService.record({
      action: 'auth.login',
      resource: `user:${user.id}`,
      userId: user.id,
      request: req,
    });

    return this.issueSessionForUser(user.id, req, res);
  }

  /** Public session issuance used by MFA verify and password login. */
  issueSessionForUser(
    userId: string,
    req: Request,
    res: Response,
    trustedDeviceId?: string | null,
  ): Promise<AuthTokenResponse> {
    return this.issueSession(userId, req, res, trustedDeviceId);
  }

  async refresh(req: Request, res: Response): Promise<AuthTokenResponse> {
    const cookieName =
      this.configService.getOrThrow<string>('refreshCookieName');
    const rawToken = req.cookies?.[cookieName] as string | undefined;
    if (!rawToken) {
      throw new UnauthorizedException({
        code: 'AUTH_REFRESH_MISSING',
        message: 'Refresh token cookie is missing.',
      });
    }

    const tokenHash = this.hashToken(rawToken);
    const stored = await this.prisma.refreshToken.findFirst({
      where: { tokenHash },
    });

    if (!stored) {
      throw new UnauthorizedException({
        code: 'AUTH_REFRESH_INVALID',
        message: 'Refresh token is invalid.',
      });
    }

    if (stored.revokedAt) {
      await this.prisma.refreshToken.updateMany({
        where: { familyId: stored.familyId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
      await this.auditService.record({
        action: 'auth.refresh_reuse',
        resource: `refresh_token:${stored.id}`,
        userId: stored.userId,
        request: req,
      });
      this.clearRefreshCookie(res);
      throw new UnauthorizedException({
        code: 'AUTH_REFRESH_REUSE',
        message: 'Refresh token reuse detected. Please sign in again.',
      });
    }

    if (stored.expiresAt.getTime() <= Date.now()) {
      await this.prisma.refreshToken.update({
        where: { id: stored.id },
        data: { revokedAt: new Date() },
      });
      this.clearRefreshCookie(res);
      throw new UnauthorizedException({
        code: 'AUTH_REFRESH_EXPIRED',
        message: 'Refresh token has expired.',
      });
    }

    const idleTtl = this.configService.getOrThrow<string>('sessionIdleTimeout');
    const idleMs = this.parseDurationMs(idleTtl);
    if (Date.now() - stored.lastActiveAt.getTime() > idleMs) {
      await this.prisma.refreshToken.updateMany({
        where: { familyId: stored.familyId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
      await this.auditService.record({
        action: 'session.idle_timeout',
        resource: `refresh_family:${stored.familyId}`,
        userId: stored.userId,
        request: req,
      });
      this.clearRefreshCookie(res);
      throw new UnauthorizedException({
        code: 'AUTH_SESSION_IDLE',
        message: 'Session expired due to inactivity. Please sign in again.',
      });
    }

    const { raw, hash, expiresAt } = this.createRefreshTokenMaterial();
    const replacement = await this.prisma.$transaction(async (tx) => {
      const created = await tx.refreshToken.create({
        data: {
          userId: stored.userId,
          tokenHash: hash,
          familyId: stored.familyId,
          expiresAt,
          lastActiveAt: new Date(),
          deviceLabel: stored.deviceLabel,
          userAgent: req.header('user-agent') ?? stored.userAgent,
          ipAddress: req.ip ?? stored.ipAddress,
          trustedDeviceId: stored.trustedDeviceId,
        },
      });
      await tx.refreshToken.update({
        where: { id: stored.id },
        data: { revokedAt: new Date(), replacedById: created.id },
      });
      return created;
    });

    this.setRefreshCookie(res, raw, expiresAt);

    await this.auditService.record({
      action: 'auth.refresh',
      resource: `refresh_token:${replacement.id}`,
      userId: stored.userId,
      request: req,
    });

    return this.buildTokenResponse(stored.userId);
  }

  async logout(req: Request, res: Response): Promise<void> {
    const cookieName =
      this.configService.getOrThrow<string>('refreshCookieName');
    const rawToken = req.cookies?.[cookieName] as string | undefined;
    if (rawToken) {
      const tokenHash = this.hashToken(rawToken);
      const stored = await this.prisma.refreshToken.findFirst({
        where: { tokenHash, revokedAt: null },
      });
      if (stored) {
        await this.prisma.refreshToken.update({
          where: { id: stored.id },
          data: { revokedAt: new Date() },
        });
        await this.auditService.record({
          action: 'auth.logout',
          resource: `user:${stored.userId}`,
          userId: stored.userId,
          request: req,
        });
      }
    }
    this.clearRefreshCookie(res);
  }

  async recordMfaFailure(
    userId: string,
    email: string,
    req: Request,
  ): Promise<void> {
    await this.recordLoginAttempt({
      userId,
      email,
      result: 'MFA_FAILURE',
      req,
    });
    await this.maybeFlagSuspiciousFailures(userId, email, req);
  }

  async recordLoginSuccess(
    userId: string,
    email: string,
    req: Request,
  ): Promise<void> {
    await this.recordLoginAttempt({
      userId,
      email,
      result: 'SUCCESS',
      reason: 'mfa_verified',
      req,
    });
  }

  private async issueSession(
    userId: string,
    req: Request,
    res: Response,
    trustedDeviceId?: string | null,
  ): Promise<AuthTokenResponse> {
    const { raw, hash, expiresAt } = this.createRefreshTokenMaterial();
    const deviceLabel = this.deviceLabelFromUa(req.header('user-agent'));
    await this.prisma.refreshToken.create({
      data: {
        userId,
        tokenHash: hash,
        familyId: randomUUID(),
        expiresAt,
        lastActiveAt: new Date(),
        deviceLabel,
        userAgent: req.header('user-agent') ?? null,
        ipAddress: req.ip ?? null,
        trustedDeviceId: trustedDeviceId ?? null,
      },
    });
    this.setRefreshCookie(res, raw, expiresAt);
    return this.buildTokenResponse(userId);
  }

  private async buildTokenResponse(userId: string): Promise<AuthTokenResponse> {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      include: {
        memberships: {
          where: { status: 'ACTIVE' },
          include: { organization: true },
        },
      },
    });

    const jwt = this.configService.getOrThrow<AppConfig['jwt']>('jwt');
    const payload: JwtPayload = { sub: user.id, email: user.email };
    const accessToken = await this.jwtService.signAsync(payload, {
      secret: jwt.accessSecret,
      expiresIn: jwt.accessTtl as `${number}${'s' | 'm' | 'h' | 'd'}`,
    });

    const view: AuthUserView = {
      id: user.id,
      email: user.email,
      name: user.name,
      mfaEnabled: user.mfaEnabled,
      isSuperAdmin: user.isSuperAdmin,
      organizations: user.memberships.map((membership) => ({
        id: membership.organization.id,
        name: membership.organization.name,
        slug: membership.organization.slug,
        role: membership.role,
        appRole: membership.appRole,
      })),
    };

    return {
      accessToken,
      expiresIn: jwt.accessTtl,
      user: view,
    };
  }

  private async findValidTrustedDevice(
    userId: string,
    req: Request,
  ): Promise<{ id: string } | null> {
    const cookieName = this.configService.getOrThrow<string>(
      'mfaTrustedDeviceCookieName',
    );
    const raw = req.cookies?.[cookieName] as string | undefined;
    if (!raw) {
      return null;
    }
    const tokenHash = this.hashToken(raw);
    const device = await this.prisma.trustedDevice.findFirst({
      where: {
        userId,
        tokenHash,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
    });
    if (!device) {
      return null;
    }
    await this.prisma.trustedDevice.update({
      where: { id: device.id },
      data: {
        lastSeenAt: new Date(),
        ipAddress: req.ip ?? device.ipAddress,
        userAgent: req.header('user-agent') ?? device.userAgent,
      },
    });
    return { id: device.id };
  }

  private async recordLoginAttempt(params: {
    userId: string | null;
    email: string;
    result: 'SUCCESS' | 'FAILURE' | 'MFA_REQUIRED' | 'MFA_FAILURE' | 'BLOCKED';
    reason?: string;
    req: Request;
  }): Promise<void> {
    await this.prisma.loginAttempt.create({
      data: {
        userId: params.userId,
        email: params.email,
        result: params.result,
        reason: params.reason ?? null,
        ipAddress: params.req.ip ?? null,
        userAgent: params.req.header('user-agent') ?? null,
      },
    });
  }

  private async maybeFlagSuspiciousFailures(
    userId: string,
    email: string,
    req: Request,
  ): Promise<void> {
    const threshold =
      this.configService.get<number>('failedLoginThreshold') ?? 5;
    const windowMinutes =
      this.configService.get<number>('failedLoginWindowMinutes') ?? 15;
    const since = new Date(Date.now() - windowMinutes * 60 * 1000);
    const count = await this.prisma.loginAttempt.count({
      where: {
        userId,
        result: { in: ['FAILURE', 'MFA_FAILURE'] },
        createdAt: { gte: since },
      },
    });
    if (count >= threshold) {
      await this.auditService.record({
        action: 'auth.suspicious_failures',
        resource: `user:${userId}`,
        userId,
        after: { count, windowMinutes, email },
        request: req,
      });
    }
  }

  private createRefreshTokenMaterial(): {
    raw: string;
    hash: string;
    expiresAt: Date;
  } {
    const raw = randomBytes(48).toString('base64url');
    const hash = this.hashToken(raw);
    const refreshTtl = this.configService.getOrThrow<string>('jwt.refreshTtl');
    const expiresAt = new Date(Date.now() + this.parseDurationMs(refreshTtl));
    return { raw, hash, expiresAt };
  }

  private hashToken(raw: string): string {
    return createHash('sha256').update(raw).digest('hex');
  }

  private deviceLabelFromUa(ua: string | undefined): string | null {
    if (!ua) {
      return null;
    }
    const browser = /Edg\//.test(ua)
      ? 'Edge'
      : /Chrome\//.test(ua)
        ? 'Chrome'
        : /Firefox\//.test(ua)
          ? 'Firefox'
          : /Safari\//.test(ua)
            ? 'Safari'
            : 'Browser';
    const os = /Mac OS X/.test(ua)
      ? 'macOS'
      : /Windows/.test(ua)
        ? 'Windows'
        : /Android/.test(ua)
          ? 'Android'
          : /iPhone|iPad/.test(ua)
            ? 'iOS'
            : 'Device';
    return `${os} · ${browser}`;
  }

  private setRefreshCookie(res: Response, raw: string, expiresAt: Date): void {
    const cookieName =
      this.configService.getOrThrow<string>('refreshCookieName');
    const secure = this.configService.getOrThrow<boolean>('cookieSecure');
    res.cookie(cookieName, raw, {
      httpOnly: true,
      secure,
      sameSite: 'lax',
      expires: expiresAt,
      path: '/api/v1/auth',
    });
  }

  private clearRefreshCookie(res: Response): void {
    const cookieName =
      this.configService.getOrThrow<string>('refreshCookieName');
    const secure = this.configService.getOrThrow<boolean>('cookieSecure');
    res.clearCookie(cookieName, {
      httpOnly: true,
      secure,
      sameSite: 'lax',
      path: '/api/v1/auth',
    });
  }

  private parseDurationMs(value: string): number {
    const match = /^(\d+)([smhd])$/.exec(value);
    if (!match) {
      return 7 * 24 * 60 * 60 * 1000;
    }
    const amount = Number(match[1]);
    const unit = match[2];
    switch (unit) {
      case 's':
        return amount * 1000;
      case 'm':
        return amount * 60 * 1000;
      case 'h':
        return amount * 60 * 60 * 1000;
      case 'd':
        return amount * 24 * 60 * 60 * 1000;
      default:
        return 7 * 24 * 60 * 60 * 1000;
    }
  }
}
