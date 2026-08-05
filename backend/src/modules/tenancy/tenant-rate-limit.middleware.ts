import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { TenancyService } from './tenancy.service';

/**
 * Soft tenant rate limiting + API metering when X-Organization-Id is present.
 * Failures are non-fatal for unauthenticated health probes.
 */
@Injectable()
export class TenantRateLimitMiddleware implements NestMiddleware {
  constructor(private readonly tenancy: TenancyService) {}

  async use(req: Request, res: Response, next: NextFunction): Promise<void> {
    const orgId = req.header('x-organization-id')?.trim();
    if (!orgId) {
      next();
      return;
    }
    // Skip health/ops probes
    if (
      req.path.includes('/health') ||
      req.path.includes('/readiness') ||
      req.path.includes('/liveness') ||
      req.path.includes('/metrics')
    ) {
      next();
      return;
    }

    try {
      await this.tenancy.ensureLimits(orgId);
      const rl = await this.tenancy.enforceRateLimit(orgId);
      res.setHeader('X-RateLimit-Remaining', String(rl.remaining));
      res.setHeader('X-RateLimit-Reset', rl.resetAt.toISOString());
      await this.tenancy.assertApiBudget(orgId);
      next();
    } catch (error) {
      // Unknown org ids / FK failures: let OrganizationGuard decide authz.
      const message = error instanceof Error ? error.message : '';
      if (
        message.includes('Foreign key') ||
        message.includes('tenant_limits') ||
        message.includes('P2003')
      ) {
        next();
        return;
      }
      next(error);
    }
  }
}
