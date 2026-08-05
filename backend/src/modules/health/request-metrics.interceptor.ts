import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Observable, tap } from 'rxjs';
import { MetricsService } from './metrics.service';

@Injectable()
export class RequestMetricsInterceptor implements NestInterceptor {
  constructor(private readonly metrics: MetricsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const http = context.switchToHttp();
    const req = http.getRequest<Request>();
    const res = http.getResponse<Response>();
    const start = Date.now();
    const span = this.metrics.startSpan('http.request', {
      method: req.method,
      path: req.route?.path ?? req.path,
    });

    return next.handle().pipe(
      tap({
        next: () => {
          const ms = Date.now() - start;
          this.metrics.increment('regintel_http_requests_total', 1, {
            method: req.method,
            status: String(res.statusCode),
          });
          this.metrics.observe('regintel_http_request_duration_ms', ms, {
            method: req.method,
          });
          span.end('ok');
          if (!res.headersSent) {
            if (req.requestId) {
              res.setHeader('X-Request-Id', req.requestId);
            }
            const correlation = req.header('x-correlation-id') ?? req.requestId;
            if (correlation) {
              res.setHeader('X-Correlation-Id', correlation);
            }
          }
        },
        error: () => {
          span.end('error');
          this.metrics.increment('regintel_http_requests_total', 1, {
            method: req.method,
            status: 'error',
          });
        },
      }),
    );
  }
}
