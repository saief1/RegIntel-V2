import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { globalErrorAggregator } from '../logging/error-aggregator';
import { structuredLog } from '../logging/structured-logger';

type ErrorBody = {
  success: false;
  error: {
    code: string;
    message: string;
    requestId: string;
    correlationId?: string;
    timestamp: string;
    details?: Array<{ field: string; message: string }>;
  };
};

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const requestId = request.requestId ?? 'unknown';
    const correlationId = request.correlationId ?? requestId;
    const timestamp = new Date().toISOString();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let code = 'INTERNAL_ERROR';
    let message = 'An unexpected error occurred.';
    let details: Array<{ field: string; message: string }> | undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
        code = this.codeFromStatus(status);
      } else if (typeof exceptionResponse === 'object' && exceptionResponse) {
        const body = exceptionResponse as Record<string, unknown>;
        code =
          typeof body.code === 'string'
            ? body.code
            : this.codeFromStatus(status);
        message =
          typeof body.message === 'string'
            ? body.message
            : Array.isArray(body.message)
              ? 'Request validation failed.'
              : exception.message;
        if (Array.isArray(body.message)) {
          code = 'VALIDATION_ERROR';
          details = (body.message as string[]).map((item) => ({
            field: 'request',
            message: item,
          }));
        }
        if (Array.isArray(body.details)) {
          details = body.details as Array<{ field: string; message: string }>;
        }
      }
    } else if (exception instanceof Error) {
      structuredLog('error', exception.message, {
        requestId,
        correlationId,
        stack: exception.stack,
      });
    } else {
      structuredLog('error', 'Unknown exception', {
        requestId,
        correlationId,
        detail: String(exception),
      });
    }

    globalErrorAggregator.record(code, message);

    const payload: ErrorBody = {
      success: false,
      error: {
        code,
        message,
        requestId,
        correlationId,
        timestamp,
        ...(details ? { details } : {}),
      },
    };

    response.status(status).json(payload);
  }

  private codeFromStatus(status: number): string {
    const map: Record<number, string> = {
      [HttpStatus.BAD_REQUEST]: 'BAD_REQUEST',
      [HttpStatus.UNAUTHORIZED]: 'UNAUTHORIZED',
      [HttpStatus.FORBIDDEN]: 'FORBIDDEN',
      [HttpStatus.NOT_FOUND]: 'NOT_FOUND',
      [HttpStatus.CONFLICT]: 'CONFLICT',
    };
    return map[status] ?? 'INTERNAL_ERROR';
  }
}
