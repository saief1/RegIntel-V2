import { Injectable } from '@nestjs/common';
import { MetricsService } from './metrics.service';

/**
 * Timing helpers for request/DB/queue/storage spans (B022).
 */
@Injectable()
export class TimingService {
  constructor(private readonly metrics: MetricsService) {}

  async timeAsync<T>(
    category: 'db' | 'queue' | 'storage' | 'other',
    name: string,
    fn: () => Promise<T>,
  ): Promise<T> {
    const span = this.metrics.startSpan(`${category}.${name}`);
    const start = Date.now();
    try {
      const result = await fn();
      this.metrics.observe(
        `regintel_${category}_duration_ms`,
        Date.now() - start,
        {
          name,
          status: 'ok',
        },
      );
      span.end('ok');
      return result;
    } catch (error) {
      this.metrics.observe(
        `regintel_${category}_duration_ms`,
        Date.now() - start,
        {
          name,
          status: 'error',
        },
      );
      span.end('error');
      throw error;
    }
  }
}
