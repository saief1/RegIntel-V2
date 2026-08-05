import { ForbiddenException, HttpException } from '@nestjs/common';
import { TenancyService } from './tenancy.service';

describe('TenancyService', () => {
  const limits = {
    plan: 'STARTER' as const,
    maxSeats: 2,
    maxStorageBytes: BigInt(1000),
    maxApiRequestsPerDay: 5,
    maxEmailsPerDay: 10,
    rateLimitPerMinute: 2,
    features: {},
  };

  function makeService(repo: Partial<Record<string, jest.Mock>>) {
    const config = {
      get: (key: string) => {
        if (key === 'tenant.defaultPlan') return 'STARTER';
        if (key === 'tenant.defaultRateLimitPerMinute') return 2;
        return undefined;
      },
    };
    return new TenancyService(
      {
        getOrCreateLimits: jest.fn().mockResolvedValue(limits),
        countActiveSeats: jest.fn().mockResolvedValue(2),
        sumStorageBytes: jest.fn().mockResolvedValue(BigInt(500)),
        incrementApiRequests: jest.fn().mockResolvedValue({ apiRequests: 6 }),
        hitRateLimit: jest.fn().mockResolvedValue({
          allowed: false,
          remaining: 0,
          resetAt: new Date(),
        }),
        ...repo,
      } as never,
      config as never,
    );
  }

  it('rejects when seat quota exceeded', async () => {
    const service = makeService({});
    await expect(service.assertSeatAvailable('org-1')).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });

  it('rejects when storage quota exceeded', async () => {
    const service = makeService({
      sumStorageBytes: jest.fn().mockResolvedValue(BigInt(900)),
    });
    await expect(
      service.assertStorageAllowed('org-1', 200),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('rejects when rate limited', async () => {
    const service = makeService({});
    await expect(service.enforceRateLimit('org-1')).rejects.toBeInstanceOf(
      HttpException,
    );
  });
});
