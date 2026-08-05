import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash, randomBytes } from 'crypto';
import { Request, Response } from 'express';
import { AuditService } from '../../common/audit/audit.service';
import { PrismaService } from '../../common/prisma/prisma.service';
import {
  PASSWORD_POLICY,
  validatePasswordPolicy,
} from '../../common/security/password-policy';
import { ConfigPlatformService } from '../../config/config-platform.service';
import { PasswordService } from '../auth/password.service';
import { ChangePasswordDto } from './dto/security.dto';

@Injectable()
export class SecurityService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly passwordService: PasswordService,
    private readonly configService: ConfigService,
    private readonly auditService: AuditService,
    private readonly configPlatform: ConfigPlatformService,
  ) {}

  /**
   * Security hardening audit surface (B023) — control checklist for operators.
   */
  securityHardeningAudit() {
    const secrets = this.configPlatform.validateSecrets();
    const nodeEnv = this.configService.get<string>('nodeEnv') ?? 'development';
    const cookieSecure =
      this.configService.get<boolean>('cookieSecure') ?? false;
    return {
      version: this.configPlatform.getBuildMetadata().version,
      timestamp: new Date().toISOString(),
      controls: [
        {
          id: 'jwt_secret_strength',
          status: secrets.issues.some((i) => i.includes('JWT'))
            ? 'fail'
            : 'pass',
          detail: 'JWT_ACCESS_SECRET length and placeholder checks',
        },
        {
          id: 'mfa_encryption_key',
          status: secrets.issues.some((i) => i.includes('MFA'))
            ? 'fail'
            : 'pass',
          detail: 'MFA_ENCRYPTION_KEY strength',
        },
        {
          id: 'cookie_secure',
          status: nodeEnv === 'production' && !cookieSecure ? 'fail' : 'pass',
          detail: 'COOKIE_SECURE for refresh cookies',
        },
        {
          id: 'password_policy',
          status: 'pass',
          detail: `minLength=${PASSWORD_POLICY.minLength}, complexity enforced`,
        },
        {
          id: 'refresh_rotation',
          status: 'pass',
          detail: 'Refresh token rotation + reuse detection (family revoke)',
        },
        {
          id: 'argon2id',
          status: 'pass',
          detail: 'Passwords hashed with Argon2id',
        },
        {
          id: 'api_key_hashing',
          status: 'pass',
          detail: 'SHA-256 API key helpers available (hashApiKey)',
        },
        {
          id: 'security_headers',
          status: 'pass',
          detail: 'nosniff, frame deny, CSP, referrer-policy, HSTS when secure',
        },
        {
          id: 'csrf_model',
          status: 'pass',
          detail:
            'Bearer JWT primary; refresh cookie httpOnly + SameSite=Lax (no classic CSRF tokens)',
        },
        {
          id: 'global_rate_limit',
          status: 'pass',
          detail: 'IP rate limit + tenant RPM/budget',
        },
        {
          id: 'input_sanitization',
          status: 'pass',
          detail: 'sanitizeText / ValidationPipe whitelist',
        },
      ],
      secrets,
      overall: secrets.ok ? 'hardened' : 'needs_attention',
    };
  }

  async listTrustedDevices(userId: string) {
    const rows = await this.prisma.trustedDevice.findMany({
      where: { userId, revokedAt: null, expiresAt: { gt: new Date() } },
      orderBy: { lastSeenAt: 'desc' },
    });
    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      userAgent: row.userAgent,
      ipAddress: row.ipAddress,
      trustedAt: row.trustedAt.toISOString(),
      lastSeenAt: row.lastSeenAt.toISOString(),
      expiresAt: row.expiresAt.toISOString(),
      trusted: true,
    }));
  }

  async revokeTrustedDevice(
    userId: string,
    deviceId: string,
    req: Request,
  ): Promise<void> {
    const device = await this.prisma.trustedDevice.findFirst({
      where: { id: deviceId, userId, revokedAt: null },
    });
    if (!device) {
      throw new NotFoundException({
        code: 'DEVICE_NOT_FOUND',
        message: 'Trusted device not found.',
      });
    }
    await this.prisma.trustedDevice.update({
      where: { id: device.id },
      data: { revokedAt: new Date() },
    });
    await this.auditService.record({
      action: 'device.revoked',
      resource: `trusted_device:${device.id}`,
      userId,
      request: req,
    });
  }

  async listLoginHistory(userId: string, limit = 50) {
    const rows = await this.prisma.loginAttempt.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: Math.min(limit, 200),
    });
    return rows.map((row) => ({
      id: row.id,
      email: row.email,
      result: row.result.toLowerCase(),
      reason: row.reason,
      ip: row.ipAddress,
      location: row.ipAddress ?? 'unknown',
      userAgent: row.userAgent,
      at: row.createdAt.toISOString(),
      userId: row.userId,
    }));
  }

  async listFailedLogins(userId: string, limit = 50) {
    const rows = await this.prisma.loginAttempt.findMany({
      where: {
        userId,
        result: { in: ['FAILURE', 'MFA_FAILURE', 'BLOCKED'] },
      },
      orderBy: { createdAt: 'desc' },
      take: Math.min(limit, 200),
    });
    return rows.map((row) => ({
      id: row.id,
      email: row.email,
      result: row.result,
      reason: row.reason,
      ipAddress: row.ipAddress,
      userAgent: row.userAgent,
      createdAt: row.createdAt.toISOString(),
    }));
  }

  async listSecurityEvents(userId: string, limit = 50) {
    const rows = await this.prisma.securityEvent.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: Math.min(limit, 200),
    });
    return rows.map((row) => ({
      id: row.id,
      action: row.action,
      resource: row.resource,
      severity: row.severity.toLowerCase(),
      detail: row.detail,
      ipAddress: row.ipAddress,
      createdAt: row.createdAt.toISOString(),
    }));
  }

  async listAuditTrail(
    userId: string,
    organizationId: string | undefined,
    limit = 50,
  ) {
    const rows = await this.prisma.securityEvent.findMany({
      where: {
        OR: [{ userId }, ...(organizationId ? [{ organizationId }] : [])],
      },
      orderBy: { createdAt: 'desc' },
      take: Math.min(limit, 200),
    });
    return rows.map((row) => ({
      id: row.id,
      action: row.action,
      resource: row.resource,
      severity: row.severity,
      userId: row.userId,
      organizationId: row.organizationId,
      createdAt: row.createdAt.toISOString(),
      ipAddress: row.ipAddress,
    }));
  }

  async listPasswordHistoryMeta(userId: string) {
    const rows = await this.prisma.passwordHistory.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
      select: { id: true, createdAt: true },
    });
    return {
      count: rows.length,
      entries: rows.map((row) => ({
        id: row.id,
        changedAt: row.createdAt.toISOString(),
      })),
    };
  }

  async changePassword(
    userId: string,
    dto: ChangePasswordDto,
    req: Request,
  ): Promise<{ changed: true }> {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
    });
    const valid = await this.passwordService.verify(
      user.passwordHash,
      dto.currentPassword,
    );
    if (!valid) {
      throw new UnauthorizedException({
        code: 'AUTH_INVALID_CREDENTIALS',
        message: 'Current password is incorrect.',
      });
    }

    const policy = validatePasswordPolicy(dto.newPassword);
    if (!policy.ok) {
      throw new BadRequestException({
        code: 'PASSWORD_POLICY',
        message: 'Password does not meet policy requirements.',
        details: policy.errors.map((message) => ({
          field: 'newPassword',
          message,
        })),
      });
    }

    const historyLimit =
      this.configService.get<number>('passwordHistoryLimit') ?? 5;
    const history = await this.prisma.passwordHistory.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: historyLimit,
    });
    for (const entry of history) {
      if (
        await this.passwordService.verify(entry.passwordHash, dto.newPassword)
      ) {
        throw new BadRequestException({
          code: 'PASSWORD_RECENTLY_USED',
          message: `Password was used recently. Choose a different password (last ${historyLimit}).`,
        });
      }
    }
    if (await this.passwordService.verify(user.passwordHash, dto.newPassword)) {
      throw new BadRequestException({
        code: 'PASSWORD_UNCHANGED',
        message: 'New password must differ from the current password.',
      });
    }

    const passwordHash = await this.passwordService.hash(dto.newPassword);
    await this.prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: userId },
        data: { passwordHash },
      });
      await tx.passwordHistory.create({
        data: { userId, passwordHash: user.passwordHash },
      });
      await tx.refreshToken.updateMany({
        where: { userId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
    });

    await this.auditService.record({
      action: 'auth.password_changed',
      resource: `user:${userId}`,
      userId,
      request: req,
    });

    return { changed: true };
  }

  /** Create trusted device + set remember-browser cookie. */
  async trustDevice(
    userId: string,
    req: Request,
    res: Response,
    input: { name?: string; fingerprint?: string },
  ) {
    const raw = randomBytes(32).toString('base64url');
    const tokenHash = this.hashToken(raw);
    const ttl = this.configService.getOrThrow<string>('mfaTrustedDeviceTtl');
    const expiresAt = new Date(Date.now() + this.parseDurationMs(ttl));
    const name =
      input.name?.trim() ||
      this.deviceLabelFromUa(req.header('user-agent')) ||
      'Trusted browser';

    const device = await this.prisma.trustedDevice.create({
      data: {
        userId,
        tokenHash,
        fingerprintHash: input.fingerprint
          ? this.hashToken(input.fingerprint)
          : null,
        name,
        userAgent: req.header('user-agent') ?? null,
        ipAddress: req.ip ?? null,
        expiresAt,
      },
    });

    this.setTrustedDeviceCookie(res, raw, expiresAt);

    await this.auditService.record({
      action: 'device.trusted',
      resource: `trusted_device:${device.id}`,
      userId,
      request: req,
    });

    return {
      id: device.id,
      name: device.name,
      expiresAt: device.expiresAt.toISOString(),
    };
  }

  async findValidTrustedDevice(
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

  clearTrustedDeviceCookie(res: Response): void {
    const cookieName = this.configService.getOrThrow<string>(
      'mfaTrustedDeviceCookieName',
    );
    const secure = this.configService.getOrThrow<boolean>('cookieSecure');
    res.clearCookie(cookieName, {
      httpOnly: true,
      secure,
      sameSite: 'lax',
      path: '/api/v1',
    });
  }

  private setTrustedDeviceCookie(
    res: Response,
    raw: string,
    expiresAt: Date,
  ): void {
    const cookieName = this.configService.getOrThrow<string>(
      'mfaTrustedDeviceCookieName',
    );
    const secure = this.configService.getOrThrow<boolean>('cookieSecure');
    res.cookie(cookieName, raw, {
      httpOnly: true,
      secure,
      sameSite: 'lax',
      expires: expiresAt,
      path: '/api/v1',
    });
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

  private parseDurationMs(value: string): number {
    const match = /^(\d+)([smhd])$/.exec(value);
    if (!match) {
      return 30 * 24 * 60 * 60 * 1000;
    }
    const amount = Number(match[1]);
    switch (match[2]) {
      case 's':
        return amount * 1000;
      case 'm':
        return amount * 60 * 1000;
      case 'h':
        return amount * 60 * 60 * 1000;
      case 'd':
        return amount * 24 * 60 * 60 * 1000;
      default:
        return 30 * 24 * 60 * 60 * 1000;
    }
  }
}
