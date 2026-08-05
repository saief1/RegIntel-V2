import { Injectable } from '@nestjs/common';
import {
  FeatureFlag,
  Prisma,
  TenantLimit,
  TenantPlan,
  TenantUsage,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export interface ITenantRepository {
  getOrCreateLimits(
    organizationId: string,
    defaults?: Partial<{
      plan: TenantPlan;
      maxSeats: number;
      rateLimitPerMinute: number;
    }>,
  ): Promise<TenantLimit>;
  getLimits(organizationId: string): Promise<TenantLimit | null>;
  updateLimits(
    organizationId: string,
    data: Partial<{
      plan: TenantPlan;
      maxSeats: number;
      maxStorageBytes: bigint;
      maxApiRequestsPerDay: number;
      maxEmailsPerDay: number;
      rateLimitPerMinute: number;
      features: Record<string, unknown>;
    }>,
  ): Promise<TenantLimit>;
  getUsage(
    organizationId: string,
    usageDate: Date,
  ): Promise<TenantUsage | null>;
  incrementApiRequests(
    organizationId: string,
    usageDate: Date,
  ): Promise<TenantUsage>;
  incrementEmailsSent(
    organizationId: string,
    usageDate: Date,
  ): Promise<TenantUsage>;
  setSeatsAndStorage(
    organizationId: string,
    usageDate: Date,
    seatsUsed: number,
    storageBytes: bigint,
  ): Promise<TenantUsage>;
  countActiveSeats(organizationId: string): Promise<number>;
  sumStorageBytes(organizationId: string): Promise<bigint>;
  getFeatureFlag(
    key: string,
    organizationId?: string | null,
  ): Promise<FeatureFlag | null>;
  upsertFeatureFlag(input: {
    key: string;
    enabled: boolean;
    organizationId?: string | null;
    description?: string;
  }): Promise<FeatureFlag>;
  hitRateLimit(
    bucketKey: string,
    limit: number,
    windowMs: number,
  ): Promise<{
    allowed: boolean;
    remaining: number;
    resetAt: Date;
  }>;
}

@Injectable()
export class TenantRepository implements ITenantRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getOrCreateLimits(
    organizationId: string,
    defaults?: Partial<{
      plan: TenantPlan;
      maxSeats: number;
      rateLimitPerMinute: number;
    }>,
  ) {
    const existing = await this.prisma.tenantLimit.findUnique({
      where: { organizationId },
    });
    if (existing) return existing;
    return this.prisma.tenantLimit.create({
      data: {
        organizationId,
        plan: defaults?.plan ?? 'STARTER',
        maxSeats: defaults?.maxSeats ?? 25,
        rateLimitPerMinute: defaults?.rateLimitPerMinute ?? 120,
      },
    });
  }

  getLimits(organizationId: string) {
    return this.prisma.tenantLimit.findUnique({ where: { organizationId } });
  }

  async updateLimits(
    organizationId: string,
    data: Partial<{
      plan: TenantPlan;
      maxSeats: number;
      maxStorageBytes: bigint;
      maxApiRequestsPerDay: number;
      maxEmailsPerDay: number;
      rateLimitPerMinute: number;
      features: Record<string, unknown>;
    }>,
  ) {
    await this.getOrCreateLimits(organizationId);
    return this.prisma.tenantLimit.update({
      where: { organizationId },
      data: {
        ...(data.plan ? { plan: data.plan } : {}),
        ...(data.maxSeats !== undefined ? { maxSeats: data.maxSeats } : {}),
        ...(data.maxStorageBytes !== undefined
          ? { maxStorageBytes: data.maxStorageBytes }
          : {}),
        ...(data.maxApiRequestsPerDay !== undefined
          ? { maxApiRequestsPerDay: data.maxApiRequestsPerDay }
          : {}),
        ...(data.maxEmailsPerDay !== undefined
          ? { maxEmailsPerDay: data.maxEmailsPerDay }
          : {}),
        ...(data.rateLimitPerMinute !== undefined
          ? { rateLimitPerMinute: data.rateLimitPerMinute }
          : {}),
        ...(data.features
          ? { features: data.features as Prisma.InputJsonValue }
          : {}),
      },
    });
  }

  getUsage(organizationId: string, usageDate: Date) {
    return this.prisma.tenantUsage.findUnique({
      where: {
        organizationId_usageDate: { organizationId, usageDate },
      },
    });
  }

  incrementApiRequests(organizationId: string, usageDate: Date) {
    return this.prisma.tenantUsage.upsert({
      where: { organizationId_usageDate: { organizationId, usageDate } },
      create: {
        organizationId,
        usageDate,
        apiRequests: 1,
      },
      update: { apiRequests: { increment: 1 } },
    });
  }

  incrementEmailsSent(organizationId: string, usageDate: Date) {
    return this.prisma.tenantUsage.upsert({
      where: { organizationId_usageDate: { organizationId, usageDate } },
      create: {
        organizationId,
        usageDate,
        emailsSent: 1,
      },
      update: { emailsSent: { increment: 1 } },
    });
  }

  setSeatsAndStorage(
    organizationId: string,
    usageDate: Date,
    seatsUsed: number,
    storageBytes: bigint,
  ) {
    return this.prisma.tenantUsage.upsert({
      where: { organizationId_usageDate: { organizationId, usageDate } },
      create: {
        organizationId,
        usageDate,
        seatsUsed,
        storageBytes,
      },
      update: { seatsUsed, storageBytes },
    });
  }

  countActiveSeats(organizationId: string) {
    return this.prisma.organizationMembership.count({
      where: { organizationId, status: 'ACTIVE' },
    });
  }

  async sumStorageBytes(organizationId: string) {
    const agg = await this.prisma.storageObject.aggregate({
      where: { organizationId, deletedAt: null },
      _sum: { byteSize: true },
    });
    return BigInt(agg._sum.byteSize ?? 0);
  }

  async getFeatureFlag(key: string, organizationId?: string | null) {
    if (organizationId) {
      const orgFlag = await this.prisma.featureFlag.findFirst({
        where: { key, organizationId },
      });
      if (orgFlag) return orgFlag;
    }
    return this.prisma.featureFlag.findFirst({
      where: { key, organizationId: null },
    });
  }

  async upsertFeatureFlag(input: {
    key: string;
    enabled: boolean;
    organizationId?: string | null;
    description?: string;
  }) {
    const existing = await this.prisma.featureFlag.findFirst({
      where: {
        key: input.key,
        organizationId: input.organizationId ?? null,
      },
    });
    if (existing) {
      return this.prisma.featureFlag.update({
        where: { id: existing.id },
        data: {
          enabled: input.enabled,
          description: input.description,
        },
      });
    }
    return this.prisma.featureFlag.create({
      data: {
        key: input.key,
        enabled: input.enabled,
        organizationId: input.organizationId ?? null,
        description: input.description,
      },
    });
  }

  async hitRateLimit(
    bucketKey: string,
    limit: number,
    windowMs: number,
  ): Promise<{ allowed: boolean; remaining: number; resetAt: Date }> {
    const now = new Date();
    const existing = await this.prisma.rateLimitBucket.findUnique({
      where: { bucketKey },
    });

    if (!existing || existing.expiresAt <= now) {
      const expiresAt = new Date(now.getTime() + windowMs);
      await this.prisma.rateLimitBucket.upsert({
        where: { bucketKey },
        create: {
          bucketKey,
          windowStart: now,
          count: 1,
          expiresAt,
        },
        update: {
          windowStart: now,
          count: 1,
          expiresAt,
        },
      });
      return {
        allowed: true,
        remaining: Math.max(0, limit - 1),
        resetAt: expiresAt,
      };
    }

    if (existing.count >= limit) {
      return {
        allowed: false,
        remaining: 0,
        resetAt: existing.expiresAt,
      };
    }

    const updated = await this.prisma.rateLimitBucket.update({
      where: { bucketKey },
      data: { count: { increment: 1 } },
    });
    return {
      allowed: true,
      remaining: Math.max(0, limit - updated.count),
      resetAt: updated.expiresAt,
    };
  }
}
