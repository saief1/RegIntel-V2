import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { createHash, randomBytes, timingSafeEqual } from 'crypto';
import { Request, Response } from 'express';
import { AuditService } from '../../common/audit/audit.service';
import {
  decryptSecret,
  encryptSecret,
} from '../../common/crypto/secret-box.util';
import {
  buildOtpAuthUrl,
  generateTotpSecret,
  verifyTotp,
} from '../../common/crypto/totp.util';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AuthService } from '../auth/auth.service';
import { AuthTokenResponse } from '../auth/auth.types';

export type MfaChallengePayload = {
  sub: string;
  purpose: 'mfa_challenge';
};

@Injectable()
export class MfaService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly auditService: AuditService,
    private readonly authService: AuthService,
  ) {}

  async getStatus(userId: string) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: {
        mfaEnabled: true,
        mfaEnrolledAt: true,
        mfaRecoveryCodes: {
          where: { usedAt: null },
          select: { id: true },
        },
      },
    });
    return {
      enrolled: user.mfaEnabled,
      enrolledAt: user.mfaEnrolledAt,
      recoveryCodesRemaining: user.mfaRecoveryCodes.length,
    };
  }

  async startEnrollment(userId: string) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
    });
    if (user.mfaEnabled) {
      throw new BadRequestException({
        code: 'MFA_ALREADY_ENABLED',
        message: 'MFA is already enabled for this account.',
      });
    }

    const secret = generateTotpSecret();
    const encrypted = encryptSecret(secret, this.encryptionKey());
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        mfaSecretEncrypted: encrypted,
        mfaEnabled: false,
        mfaEnrolledAt: null,
      },
    });

    return {
      secret,
      otpauthUrl: buildOtpAuthUrl({
        secret,
        accountName: user.email,
        issuer: 'RegIntel',
      }),
    };
  }

  async confirmEnrollment(userId: string, code: string, req: Request) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
    });
    if (!user.mfaSecretEncrypted) {
      throw new BadRequestException({
        code: 'MFA_ENROLLMENT_NOT_STARTED',
        message: 'Start MFA enrollment before confirming.',
      });
    }
    if (user.mfaEnabled) {
      throw new BadRequestException({
        code: 'MFA_ALREADY_ENABLED',
        message: 'MFA is already enabled for this account.',
      });
    }

    const secret = decryptSecret(user.mfaSecretEncrypted, this.encryptionKey());
    if (!verifyTotp(secret, code)) {
      throw new UnauthorizedException({
        code: 'MFA_INVALID_CODE',
        message: 'The MFA code is invalid or expired.',
      });
    }

    const recoveryCodes = this.generateRecoveryCodes();
    await this.prisma.$transaction(async (tx) => {
      await tx.mfaRecoveryCode.deleteMany({ where: { userId } });
      await tx.mfaRecoveryCode.createMany({
        data: recoveryCodes.map((raw) => ({
          userId,
          codeHash: this.hashRecoveryCode(raw),
        })),
      });
      await tx.user.update({
        where: { id: userId },
        data: { mfaEnabled: true, mfaEnrolledAt: new Date() },
      });
    });

    await this.auditService.record({
      action: 'mfa.enabled',
      resource: `user:${userId}`,
      userId,
      request: req,
    });

    return { enrolled: true, recoveryCodes };
  }

  async disable(
    userId: string,
    input: { code?: string; recoveryCode?: string },
    req: Request,
  ) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
    });
    if (!user.mfaEnabled || !user.mfaSecretEncrypted) {
      throw new BadRequestException({
        code: 'MFA_NOT_ENABLED',
        message: 'MFA is not enabled for this account.',
      });
    }

    await this.assertMfaFactor(userId, user.mfaSecretEncrypted, input);

    await this.prisma.$transaction(async (tx) => {
      await tx.mfaRecoveryCode.deleteMany({ where: { userId } });
      await tx.user.update({
        where: { id: userId },
        data: {
          mfaEnabled: false,
          mfaSecretEncrypted: null,
          mfaEnrolledAt: null,
        },
      });
    });

    await this.auditService.record({
      action: 'mfa.disabled',
      resource: `user:${userId}`,
      userId,
      request: req,
    });

    return { enrolled: false };
  }

  async regenerateRecoveryCodes(
    userId: string,
    code: string,
    req: Request,
  ): Promise<{ recoveryCodes: string[] }> {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
    });
    if (!user.mfaEnabled || !user.mfaSecretEncrypted) {
      throw new BadRequestException({
        code: 'MFA_NOT_ENABLED',
        message: 'MFA is not enabled for this account.',
      });
    }
    await this.assertMfaFactor(userId, user.mfaSecretEncrypted, { code });

    const recoveryCodes = this.generateRecoveryCodes();
    await this.prisma.$transaction(async (tx) => {
      await tx.mfaRecoveryCode.deleteMany({ where: { userId } });
      await tx.mfaRecoveryCode.createMany({
        data: recoveryCodes.map((raw) => ({
          userId,
          codeHash: this.hashRecoveryCode(raw),
        })),
      });
    });

    await this.auditService.record({
      action: 'mfa.recovery_regenerated',
      resource: `user:${userId}`,
      userId,
      request: req,
    });

    return { recoveryCodes };
  }

  async createChallengeToken(userId: string): Promise<string> {
    const payload: MfaChallengePayload = {
      sub: userId,
      purpose: 'mfa_challenge',
    };
    return this.jwtService.signAsync(payload, {
      secret: this.configService.getOrThrow<string>('jwt.accessSecret'),
      expiresIn: '5m',
    });
  }

  async verifyLoginChallenge(
    dto: { mfaChallengeToken: string; code?: string; recoveryCode?: string },
    req: Request,
    res: Response,
  ): Promise<AuthTokenResponse> {
    let payload: MfaChallengePayload;
    try {
      payload = await this.jwtService.verifyAsync<MfaChallengePayload>(
        dto.mfaChallengeToken,
        {
          secret: this.configService.getOrThrow<string>('jwt.accessSecret'),
        },
      );
    } catch {
      throw new UnauthorizedException({
        code: 'MFA_CHALLENGE_INVALID',
        message: 'MFA challenge token is invalid or expired.',
      });
    }

    if (payload.purpose !== 'mfa_challenge') {
      throw new UnauthorizedException({
        code: 'MFA_CHALLENGE_INVALID',
        message: 'MFA challenge token is invalid or expired.',
      });
    }

    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: payload.sub },
    });
    if (!user.mfaEnabled || !user.mfaSecretEncrypted) {
      throw new BadRequestException({
        code: 'MFA_NOT_ENABLED',
        message: 'MFA is not enabled for this account.',
      });
    }

    await this.assertMfaFactor(user.id, user.mfaSecretEncrypted, dto);

    await this.auditService.record({
      action: 'mfa.verified',
      resource: `user:${user.id}`,
      userId: user.id,
      request: req,
    });

    return this.authService.issueSessionForUser(user.id, req, res);
  }

  private async assertMfaFactor(
    userId: string,
    encryptedSecret: string,
    input: { code?: string; recoveryCode?: string },
  ): Promise<void> {
    if (input.code) {
      const secret = decryptSecret(encryptedSecret, this.encryptionKey());
      if (verifyTotp(secret, input.code)) {
        return;
      }
      throw new UnauthorizedException({
        code: 'MFA_INVALID_CODE',
        message: 'The MFA code is invalid or expired.',
      });
    }

    if (input.recoveryCode) {
      const ok = await this.consumeRecoveryCode(userId, input.recoveryCode);
      if (ok) {
        return;
      }
      throw new UnauthorizedException({
        code: 'MFA_INVALID_RECOVERY_CODE',
        message: 'The recovery code is invalid or already used.',
      });
    }

    throw new BadRequestException({
      code: 'MFA_FACTOR_REQUIRED',
      message: 'Provide a TOTP code or recovery code.',
    });
  }

  private async consumeRecoveryCode(
    userId: string,
    recoveryCode: string,
  ): Promise<boolean> {
    const codes = await this.prisma.mfaRecoveryCode.findMany({
      where: { userId, usedAt: null },
    });
    const normalized = recoveryCode.trim().toUpperCase();
    for (const row of codes) {
      const hash = this.hashRecoveryCode(normalized);
      const a = Buffer.from(hash);
      const b = Buffer.from(row.codeHash);
      if (a.length === b.length && timingSafeEqual(a, b)) {
        await this.prisma.mfaRecoveryCode.update({
          where: { id: row.id },
          data: { usedAt: new Date() },
        });
        return true;
      }
    }
    return false;
  }

  private generateRecoveryCodes(count = 10): string[] {
    const codes: string[] = [];
    for (let i = 0; i < count; i += 1) {
      const raw = randomBytes(5).toString('hex').toUpperCase();
      codes.push(`${raw.slice(0, 4)}-${raw.slice(4, 8)}-${raw.slice(8)}`);
    }
    return codes;
  }

  private hashRecoveryCode(code: string): string {
    return createHash('sha256').update(code.trim().toUpperCase()).digest('hex');
  }

  private encryptionKey(): string {
    return this.configService.getOrThrow<string>('mfaEncryptionKey');
  }
}
