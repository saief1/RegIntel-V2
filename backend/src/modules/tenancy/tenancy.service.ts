import {
  ForbiddenException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TenantPlan } from '@prisma/client';
import { ITenantRepository } from '../../common/repositories/tenant.repository';
import { TENANT_REPOSITORY } from '../../common/repositories/tokens';

@Injectable()
export class TenancyService {
  constructor(
    @Inject(TENANT_REPOSITORY) private readonly repo: ITenantRepository,
    private readonly config: ConfigService,
  ) {}

  private todayUtc(): Date {
    const d = new Date();
    return new Date(
      Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()),
    );
  }

  async ensureLimits(organizationId: string) {
    const defaultPlan = (
      this.config.get<string>('tenant.defaultPlan') ?? 'STARTER'
    ).toUpperCase() as TenantPlan;
    const rate =
      this.config.get<number>('tenant.defaultRateLimitPerMinute') ?? 120;
    return this.repo.getOrCreateLimits(organizationId, {
      plan: defaultPlan,
      rateLimitPerMinute: rate,
    });
  }

  async getTenantContext(organizationId: string) {
    const limits = await this.ensureLimits(organizationId);
    const seatsUsed = await this.repo.countActiveSeats(organizationId);
    const storageBytes = await this.repo.sumStorageBytes(organizationId);
    const usage = await this.repo.getUsage(organizationId, this.todayUtc());
    await this.repo.setSeatsAndStorage(
      organizationId,
      this.todayUtc(),
      seatsUsed,
      storageBytes,
    );
    return {
      organizationId,
      plan: limits.plan,
      limits: {
        maxSeats: limits.maxSeats,
        maxStorageBytes: limits.maxStorageBytes.toString(),
        maxApiRequestsPerDay: limits.maxApiRequestsPerDay,
        maxEmailsPerDay: limits.maxEmailsPerDay,
        rateLimitPerMinute: limits.rateLimitPerMinute,
        features: limits.features,
      },
      usage: {
        seatsUsed,
        storageBytes: storageBytes.toString(),
        apiRequests: usage?.apiRequests ?? 0,
        emailsSent: usage?.emailsSent ?? 0,
        usageDate: this.todayUtc().toISOString().slice(0, 10),
      },
    };
  }

  async assertSeatAvailable(organizationId: string) {
    const limits = await this.ensureLimits(organizationId);
    const seats = await this.repo.countActiveSeats(organizationId);
    if (seats >= limits.maxSeats) {
      throw new ForbiddenException({
        code: 'SEAT_QUOTA_EXCEEDED',
        message: `Organization seat limit (${limits.maxSeats}) reached for plan ${limits.plan}.`,
      });
    }
  }

  async assertStorageAllowed(organizationId: string, additionalBytes: number) {
    const limits = await this.ensureLimits(organizationId);
    const used = await this.repo.sumStorageBytes(organizationId);
    if (used + BigInt(additionalBytes) > limits.maxStorageBytes) {
      throw new ForbiddenException({
        code: 'STORAGE_QUOTA_EXCEEDED',
        message: 'Organization storage quota exceeded.',
      });
    }
  }

  async assertApiBudget(organizationId: string) {
    const limits = await this.ensureLimits(organizationId);
    const usage = await this.repo.incrementApiRequests(
      organizationId,
      this.todayUtc(),
    );
    if (usage.apiRequests > limits.maxApiRequestsPerDay) {
      throw new HttpException(
        {
          code: 'API_QUOTA_EXCEEDED',
          message: 'Daily API request quota exceeded for this organization.',
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
  }

  async enforceRateLimit(organizationId: string) {
    const limits = await this.ensureLimits(organizationId);
    const result = await this.repo.hitRateLimit(
      `org:${organizationId}:rpm`,
      limits.rateLimitPerMinute,
      60_000,
    );
    if (!result.allowed) {
      throw new HttpException(
        {
          code: 'RATE_LIMITED',
          message: 'Organization rate limit exceeded. Retry after reset.',
          resetAt: result.resetAt.toISOString(),
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
    return result;
  }

  async isFeatureEnabled(
    key: string,
    organizationId?: string | null,
  ): Promise<boolean> {
    const flag = await this.repo.getFeatureFlag(key, organizationId);
    return flag?.enabled === true;
  }

  upsertFeatureFlag(input: {
    key: string;
    enabled: boolean;
    organizationId?: string | null;
    description?: string;
  }) {
    return this.repo.upsertFeatureFlag(input);
  }

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
  ) {
    return this.repo.updateLimits(organizationId, data);
  }

  recordEmailSent(organizationId: string) {
    return this.repo.incrementEmailsSent(organizationId, this.todayUtc());
  }
}
