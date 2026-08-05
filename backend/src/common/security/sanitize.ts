/**
 * Input/output sanitization helpers (OWASP-minded, no DOM dependency).
 */

/* eslint-disable no-control-regex -- intentional stripping of ASCII control chars */
const CONTROL_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;
/* eslint-enable no-control-regex */
const SCRIPT_TAG = /<\s*\/?\s*script\b[^>]*>/gi;
const ON_EVENT = /\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi;
const JS_URI = /javascript\s*:/gi;
const DATA_HTML_URI = /data\s*:\s*text\/html/gi;

/** Strip control characters and common XSS vectors from free-text input. */
export function sanitizeText(input: string, maxLength = 10_000): string {
  let out = input.replace(CONTROL_CHARS, '');
  out = out.replace(SCRIPT_TAG, '');
  out = out.replace(ON_EVENT, '');
  out = out.replace(JS_URI, '');
  out = out.replace(DATA_HTML_URI, '');
  if (out.length > maxLength) {
    out = out.slice(0, maxLength);
  }
  return out.trim();
}

/** Recursively sanitize string values in plain objects/arrays. */
export function sanitizeDeep<T>(value: T, maxLength = 10_000): T {
  if (typeof value === 'string') {
    return sanitizeText(value, maxLength) as T;
  }
  if (Array.isArray(value)) {
    const items = value as unknown[];
    return items.map((item) => sanitizeDeep(item, maxLength)) as T;
  }
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = sanitizeDeep(v, maxLength);
    }
    return out as T;
  }
  return value;
}

/** Redact likely secrets from diagnostic / log payloads. */
export function redactSecrets(
  fields: Record<string, unknown>,
): Record<string, unknown> {
  const secretKey =
    /(password|secret|token|api[_-]?key|authorization|cookie|credential)/i;
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(fields)) {
    if (secretKey.test(k)) {
      out[k] = '[REDACTED]';
    } else if (v && typeof v === 'object' && !Array.isArray(v)) {
      out[k] = redactSecrets(v as Record<string, unknown>);
    } else {
      out[k] = v;
    }
  }
  return out;
}
