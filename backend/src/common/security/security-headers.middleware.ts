import { NextFunction, Request, Response } from 'express';

/**
 * OWASP-minded security headers without an external helmet dependency (B023).
 * CSRF: Bearer JWT APIs do not use classic double-submit CSRF; refresh cookies
 * use httpOnly + SameSite (set in auth cookie options).
 */
export function securityHeadersMiddleware(
  _req: Request,
  res: Response,
  next: NextFunction,
): void {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('X-XSS-Protection', '0');
  res.setHeader(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), payment=()',
  );
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  res.setHeader('Cross-Origin-Resource-Policy', 'same-site');
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'none'; frame-ancestors 'none'; base-uri 'none'",
  );
  // HSTS only meaningful over TLS; safe to advertise when behind TLS terminator.
  if (
    process.env.COOKIE_SECURE === 'true' ||
    process.env.NODE_ENV === 'production'
  ) {
    res.setHeader(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains',
    );
  }
  next();
}
