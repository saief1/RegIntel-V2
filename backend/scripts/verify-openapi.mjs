/**
 * OpenAPI verification (B024/B025).
 * Prefer live API when available; otherwise generate the document via Nest bootstrap.
 */
import { writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const baseUrl = process.env.API_BASE_URL ?? 'http://localhost:3000';
const required = [
  '/api/v1/health',
  '/api/v1/auth/login',
  '/api/v1/auth/refresh',
  '/api/v1/auth/logout',
  '/api/v1/users/me',
  '/api/v1/organizations',
];

function assertPaths(paths) {
  for (const path of required) {
    if (!paths.includes(path)) {
      throw new Error(`OpenAPI missing path: ${path}`);
    }
  }
}

async function tryLive() {
  const healthRes = await fetch(`${baseUrl}/api/v1/health`);
  if (!healthRes.ok) return null;
  const health = await healthRes.json();
  if (health?.success !== true) {
    throw new Error('Health response missing success envelope');
  }
  const docsRes = await fetch(`${baseUrl}/api/docs-json`);
  if (!docsRes.ok) {
    throw new Error(`OpenAPI JSON failed: ${docsRes.status}`);
  }
  const doc = await docsRes.json();
  const paths = Object.keys(doc.paths ?? {});
  assertPaths(paths);
  return {
    mode: 'live',
    openapiPaths: paths.length,
    health: health.data?.status ?? health.data,
  };
}

function generateOffline() {
  const here = dirname(fileURLToPath(import.meta.url));
  const generator = join(here, 'generate-openapi.cjs');
  const result = spawnSync(process.execPath, [generator], {
    cwd: join(here, '..'),
    encoding: 'utf8',
    env: {
      ...process.env,
      NODE_ENV: process.env.NODE_ENV ?? 'development',
      // Minimal env so ConfigModule validation can load when .env absent in CI.
      DATABASE_URL:
        process.env.DATABASE_URL ??
        'postgresql://regintel:regintel@127.0.0.1:5432/regintel?schema=public',
      DIRECT_URL:
        process.env.DIRECT_URL ??
        'postgresql://regintel:regintel@127.0.0.1:5432/regintel?schema=public',
      REDIS_URL: process.env.REDIS_URL ?? 'redis://127.0.0.1:6379',
      JWT_ACCESS_SECRET:
        process.env.JWT_ACCESS_SECRET ??
        'ci-access-secret-change-me-min-32-chars!!',
      JWT_ACCESS_TTL: process.env.JWT_ACCESS_TTL ?? '15m',
      JWT_REFRESH_TTL: process.env.JWT_REFRESH_TTL ?? '7d',
      CORS_ORIGINS: process.env.CORS_ORIGINS ?? 'http://localhost:5173',
      MFA_ENCRYPTION_KEY:
        process.env.MFA_ENCRYPTION_KEY ??
        'ci-mfa-encryption-key-change-me-32b!!',
    },
  });
  if (result.status !== 0) {
    throw new Error(
      `Offline OpenAPI generation failed:\n${result.stdout}\n${result.stderr}`,
    );
  }
  const payload = JSON.parse(result.stdout.trim().split('\n').at(-1));
  assertPaths(payload.paths);
  const out = join(here, '..', 'openapi.generated.json');
  writeFileSync(out, JSON.stringify(payload.document, null, 2));
  return {
    mode: 'offline',
    openapiPaths: payload.paths.length,
    written: out,
  };
}

async function main() {
  try {
    const live = await tryLive();
    if (live) {
      console.log(JSON.stringify({ ok: true, ...live }));
      return;
    }
  } catch {
    // fall through to offline generation
  }
  const offline = generateOffline();
  console.log(JSON.stringify({ ok: true, ...offline }));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
