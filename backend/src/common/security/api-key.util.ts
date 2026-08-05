import { createHash, randomBytes, timingSafeEqual } from 'crypto';

/**
 * API key hashing helpers (B023). Store only hashes; compare in constant time.
 * Format of issued keys: `rik_<prefix>_<secret>` where prefix is public lookup id.
 */

export function generateApiKey(prefixBytes = 4): {
  raw: string;
  prefix: string;
  hash: string;
} {
  const prefix = randomBytes(prefixBytes).toString('hex');
  const secret = randomBytes(24).toString('base64url');
  const raw = `rik_${prefix}_${secret}`;
  return { raw, prefix, hash: hashApiKey(raw) };
}

export function hashApiKey(raw: string): string {
  return createHash('sha256').update(raw, 'utf8').digest('hex');
}

export function verifyApiKey(raw: string, expectedHash: string): boolean {
  const actual = Buffer.from(hashApiKey(raw), 'hex');
  const expected = Buffer.from(expectedHash, 'hex');
  if (actual.length !== expected.length) return false;
  return timingSafeEqual(actual, expected);
}
