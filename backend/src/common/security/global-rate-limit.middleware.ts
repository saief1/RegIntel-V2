import {
  HttpException,
  HttpStatus,
  Injectable,
  NestMiddleware,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NextFunction, Request, Response } from 'express';

type Bucket = { count: number; resetAt: number };

/**
 * Process-local IP rate limit for unauthenticated / global abuse protection (B023).
 * Tenant RPM remains in TenancyModule (B019).
 */
@Injectable()
export class GlobalRateLimitMiddleware implements NestMiddleware {
  private readonly buckets = new Map<string, Bucket>();

  constructor(private readonly config: ConfigService) {}

  use(req: Request, res: Response, next: NextFunction): void {
    if (this.isProbe(req.path)) {
      next();
      return;
    }

    const limit =
      this.config.get<number>('globalRateLimitPerMinute') ??
      Number(process.env.GLOBAL_RATE_LIMIT_PER_MINUTE ?? 300);
    const windowMs = 60_000;
    const now = Date.now();
    const key = this.clientKey(req);
    let bucket = this.buckets.get(key);
    if (!bucket || bucket.resetAt <= now) {
      bucket = { count: 0, resetAt: now + windowMs };
      this.buckets.set(key, bucket);
    }
    bucket.count += 1;
    const remaining = Math.max(0, limit - bucket.count);
    res.setHeader('X-Global-RateLimit-Limit', String(limit));
    res.setHeader('X-Global-RateLimit-Remaining', String(remaining));
    res.setHeader(
      'X-Global-RateLimit-Reset',
      new Date(bucket.resetAt).toISOString(),
    );

    if (bucket.count > limit) {
      throw new HttpException(
        {
          code: 'RATE_LIMITED',
          message: 'Too many requests. Slow down and retry shortly.',
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    // Opportunistic cleanup
    if (this.buckets.size > 10_000) {
      for (const [k, v] of this.buckets) {
        if (v.resetAt <= now) this.buckets.delete(k);
      }
    }

    next();
  }

  private clientKey(req: Request): string {
    const forwarded = req.header('x-forwarded-for')?.split(',')[0]?.trim();
    return forwarded || req.ip || req.socket.remoteAddress || 'unknown';
  }

  private isProbe(path: string): boolean {
    return (
      path.includes('/health') ||
      path.includes('/readiness') ||
      path.includes('/liveness') ||
      path.includes('/metrics') ||
      path.includes('/ops/')
    );
  }
}
