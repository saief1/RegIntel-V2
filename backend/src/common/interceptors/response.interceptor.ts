import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';

type Meta = {
  page: number;
  pageSize: number;
  total: number;
};

type Envelope = {
  success: true;
  data: unknown;
  meta?: Meta;
};

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(
    _context: ExecutionContext,
    next: CallHandler,
  ): Observable<unknown> {
    return next.handle().pipe(
      map((body: unknown) => {
        if (body === undefined || body === null) {
          return body;
        }

        if (
          typeof body === 'object' &&
          body !== null &&
          'success' in body &&
          body.success === true
        ) {
          return body;
        }

        if (
          typeof body === 'object' &&
          body !== null &&
          'data' in body &&
          'meta' in body
        ) {
          const listBody = body as { data: unknown; meta: Meta };
          const envelope: Envelope = {
            success: true,
            data: listBody.data,
            meta: listBody.meta,
          };
          return envelope;
        }

        const envelope: Envelope = {
          success: true,
          data: body,
        };
        return envelope;
      }),
    );
  }
}
