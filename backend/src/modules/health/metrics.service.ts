import { Injectable } from '@nestjs/common';

/**
 * Lightweight in-process Prometheus-style metrics (no prom-client dependency).
 * OpenTelemetry hooks are stubbed for future wiring.
 */
@Injectable()
export class MetricsService {
  private readonly counters = new Map<string, number>();
  private readonly histograms = new Map<string, number[]>();
  private startedAt = Date.now();

  increment(name: string, value = 1, labels?: Record<string, string>) {
    const key = this.key(name, labels);
    this.counters.set(key, (this.counters.get(key) ?? 0) + value);
  }

  observe(name: string, valueMs: number, labels?: Record<string, string>) {
    const key = this.key(name, labels);
    const arr = this.histograms.get(key) ?? [];
    arr.push(valueMs);
    if (arr.length > 1000) arr.shift();
    this.histograms.set(key, arr);
  }

  /** OpenTelemetry stub — records intent without exporting. */
  startSpan(name: string, attributes?: Record<string, string>) {
    const start = Date.now();
    return {
      end: (status: 'ok' | 'error' = 'ok') => {
        this.observe('otel_span_duration_ms', Date.now() - start, {
          name,
          status,
          ...attributes,
        });
        this.increment('otel_span_total', 1, { name, status });
      },
    };
  }

  renderPrometheus(): string {
    const lines: string[] = [
      '# HELP process_uptime_seconds Process uptime in seconds',
      '# TYPE process_uptime_seconds gauge',
      `process_uptime_seconds ${(Date.now() - this.startedAt) / 1000}`,
      '# HELP regintel_http_requests_total HTTP requests',
      '# TYPE regintel_http_requests_total counter',
    ];

    for (const [key, value] of this.counters.entries()) {
      lines.push(`${key} ${value}`);
    }
    for (const [key, values] of this.histograms.entries()) {
      if (values.length === 0) continue;
      const sum = values.reduce((a, b) => a + b, 0);
      const count = values.length;
      const avg = sum / count;
      lines.push(`# TYPE ${key}_avg gauge`);
      lines.push(`${key}_avg ${avg.toFixed(3)}`);
      lines.push(`# TYPE ${key}_count counter`);
      lines.push(`${key}_count ${count}`);
    }
    return `${lines.join('\n')}\n`;
  }

  private key(name: string, labels?: Record<string, string>) {
    if (!labels || Object.keys(labels).length === 0) return name;
    const labelStr = Object.entries(labels)
      .map(([k, v]) => `${k}="${v}"`)
      .join(',');
    return `${name}{${labelStr}}`;
  }
}
