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
import { AuthTokenResponse, AuthUserView, JwtPayload } from './auth.types';
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
          status: 'ACTIVE',
        },
      });
      return createdUser;
    });

    await this.auditService.record({
      action: 'auth.register',
      resource: `user:${user.id}`,
      userId: user.id,
      request: req,
    });

    return this.issueSession(user.id, req, res);
  }

  async login(
    dto: LoginDto,
    req: Request,
    res: Response,
  ): Promise<AuthTokenResponse> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    const valid =
      !!user &&
      (await this.passwordService.verify(user.passwordHash, dto.password));

    if (!user || !valid) {
      await this.auditService.record({
        action: 'auth.login_failed',
        resource: `email:${dto.email.toLowerCase()}`,
        userId: user?.id ?? null,
        request: req,
      });
      throw new UnauthorizedException({
        code: 'AUTH_INVALID_CREDENTIALS',
        message: 'Email or password is incorrect.',
      });
    }

    await this.auditService.record({
      action: 'auth.login',
      resource: `user:${user.id}`,
      userId: user.id,
      request: req,
    });

    return this.issueSession(user.id, req, res);
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

    const { raw, hash, expiresAt } = this.createRefreshTokenMaterial();
    const replacement = await this.prisma.$transaction(async (tx) => {
      const created = await tx.refreshToken.create({
        data: {
          userId: stored.userId,
          tokenHash: hash,
          familyId: stored.familyId,
          expiresAt,
          userAgent: req.header('user-agent') ?? null,
          ipAddress: req.ip ?? null,
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

  private async issueSession(
    userId: string,
    req: Request,
    res: Response,
  ): Promise<AuthTokenResponse> {
    const { raw, hash, expiresAt } = this.createRefreshTokenMaterial();
    await this.prisma.refreshToken.create({
      data: {
        userId,
        tokenHash: hash,
        familyId: randomUUID(),
        expiresAt,
        userAgent: req.header('user-agent') ?? null,
        ipAddress: req.ip ?? null,
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
      organizations: user.memberships.map((membership) => ({
        id: membership.organization.id,
        name: membership.organization.name,
        slug: membership.organization.slug,
        role: membership.role,
      })),
    };

    return {
      accessToken,
      expiresIn: jwt.accessTtl,
      user: view,
    };
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
