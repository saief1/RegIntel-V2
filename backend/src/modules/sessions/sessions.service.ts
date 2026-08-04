import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash } from 'crypto';
import { Request } from 'express';
import { AuditService } from '../../common/audit/audit.service';
import { PrismaService } from '../../common/prisma/prisma.service';

export type SessionView = {
  id: string;
  familyId: string;
  device: string;
  browser: string;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
  lastActiveAt: string;
  expiresAt: string;
  current: boolean;
  userId: string;
};

@Injectable()
export class SessionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly auditService: AuditService,
  ) {}

  async listSessions(userId: string, req: Request): Promise<SessionView[]> {
    const currentFamilyId = await this.resolveCurrentFamilyId(req, userId);
    const tokens = await this.prisma.refreshToken.findMany({
      where: {
        userId,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { lastActiveAt: 'desc' },
    });

    // One row per refresh family (latest active token).
    const byFamily = new Map<string, (typeof tokens)[number]>();
    for (const token of tokens) {
      if (!byFamily.has(token.familyId)) {
        byFamily.set(token.familyId, token);
      }
    }

    return [...byFamily.values()].map((token) =>
      this.toView(token, currentFamilyId === token.familyId),
    );
  }

  async revokeSession(
    userId: string,
    sessionId: string,
    req: Request,
  ): Promise<void> {
    const token = await this.prisma.refreshToken.findFirst({
      where: { id: sessionId, userId },
    });
    if (!token) {
      throw new NotFoundException({
        code: 'SESSION_NOT_FOUND',
        message: 'Session not found.',
      });
    }
    await this.prisma.refreshToken.updateMany({
      where: { familyId: token.familyId, userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    await this.auditService.record({
      action: 'session.revoked',
      resource: `refresh_family:${token.familyId}`,
      userId,
      request: req,
    });
  }

  async logoutEverywhere(
    userId: string,
    req: Request,
  ): Promise<{ revoked: number }> {
    const result = await this.prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    await this.auditService.record({
      action: 'auth.logout_all',
      resource: `user:${userId}`,
      userId,
      after: { revoked: result.count },
      request: req,
    });
    return { revoked: result.count };
  }

  /**
   * Enforce idle timeout on the current refresh family.
   * Returns false when the session should be rejected.
   */
  async touchOrRejectIdle(
    refreshTokenId: string,
    userId: string,
    req: Request,
  ): Promise<boolean> {
    const idleTtl = this.configService.getOrThrow<string>('sessionIdleTimeout');
    const idleMs = this.parseDurationMs(idleTtl);
    const token = await this.prisma.refreshToken.findFirst({
      where: { id: refreshTokenId, userId },
    });
    if (!token || token.revokedAt) {
      return false;
    }
    if (Date.now() - token.lastActiveAt.getTime() > idleMs) {
      await this.prisma.refreshToken.updateMany({
        where: { familyId: token.familyId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
      await this.auditService.record({
        action: 'session.idle_timeout',
        resource: `refresh_family:${token.familyId}`,
        userId,
        request: req,
      });
      return false;
    }
    await this.prisma.refreshToken.update({
      where: { id: token.id },
      data: {
        lastActiveAt: new Date(),
        userAgent: req.header('user-agent') ?? token.userAgent,
        ipAddress: req.ip ?? token.ipAddress,
      },
    });
    return true;
  }

  getIdleTimeoutSeconds(): number {
    const idleTtl = this.configService.getOrThrow<string>('sessionIdleTimeout');
    return Math.floor(this.parseDurationMs(idleTtl) / 1000);
  }

  private async resolveCurrentFamilyId(
    req: Request,
    userId: string,
  ): Promise<string | null> {
    const cookieName =
      this.configService.getOrThrow<string>('refreshCookieName');
    const raw = req.cookies?.[cookieName] as string | undefined;
    if (!raw) {
      return null;
    }
    const tokenHash = createHash('sha256').update(raw).digest('hex');
    const stored = await this.prisma.refreshToken.findFirst({
      where: { tokenHash, userId, revokedAt: null },
    });
    return stored?.familyId ?? null;
  }

  private toView(
    token: {
      id: string;
      familyId: string;
      userId: string;
      deviceLabel: string | null;
      userAgent: string | null;
      ipAddress: string | null;
      createdAt: Date;
      lastActiveAt: Date;
      expiresAt: Date;
    },
    current: boolean,
  ): SessionView {
    const parsed = this.parseUa(token.userAgent);
    return {
      id: token.id,
      familyId: token.familyId,
      device: token.deviceLabel ?? parsed.device,
      browser: parsed.browser,
      ipAddress: token.ipAddress,
      userAgent: token.userAgent,
      createdAt: token.createdAt.toISOString(),
      lastActiveAt: token.lastActiveAt.toISOString(),
      expiresAt: token.expiresAt.toISOString(),
      current,
      userId: token.userId,
    };
  }

  private parseUa(ua: string | null): { device: string; browser: string } {
    if (!ua) {
      return { device: 'Unknown device', browser: 'Unknown' };
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
    const device = /iPhone|iPad/.test(ua)
      ? 'iOS device'
      : /Android/.test(ua)
        ? 'Android device'
        : /Mac OS X/.test(ua)
          ? 'macOS'
          : /Windows/.test(ua)
            ? 'Windows'
            : 'Device';
    return { device, browser };
  }

  private parseDurationMs(value: string): number {
    const match = /^(\d+)([smhd])$/.exec(value);
    if (!match) {
      return 30 * 60 * 1000;
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
        return 30 * 60 * 1000;
    }
  }
}
