import { randomUUID } from 'crypto';
import { NextFunction, Request, Response } from 'express';

export const REQUEST_ID_HEADER = 'x-request-id';
export const CORRELATION_ID_HEADER = 'x-correlation-id';

export function requestIdMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const incomingRequestId = req.header(REQUEST_ID_HEADER);
  const requestId =
    incomingRequestId && incomingRequestId.trim().length > 0
      ? incomingRequestId.trim()
      : randomUUID();
  req.requestId = requestId;

  const incomingCorrelation = req.header(CORRELATION_ID_HEADER);
  const correlationId =
    incomingCorrelation && incomingCorrelation.trim().length > 0
      ? incomingCorrelation.trim()
      : requestId;
  req.correlationId = correlationId;

  res.setHeader(REQUEST_ID_HEADER, requestId);
  res.setHeader(CORRELATION_ID_HEADER, correlationId);
  next();
}
