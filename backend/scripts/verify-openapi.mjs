const baseUrl = process.env.API_BASE_URL ?? 'http://localhost:3000';

async function main() {
  const healthRes = await fetch(`${baseUrl}/api/v1/health`);
  if (!healthRes.ok) {
    throw new Error(`Health check failed: ${healthRes.status}`);
  }
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
  const required = [
    '/api/v1/health',
    '/api/v1/auth/login',
    '/api/v1/auth/refresh',
    '/api/v1/auth/logout',
    '/api/v1/users/me',
    '/api/v1/organizations',
  ];
  for (const path of required) {
    if (!paths.includes(path)) {
      throw new Error(`OpenAPI missing path: ${path}`);
    }
  }
  console.log(
    JSON.stringify({
      ok: true,
      openapiPaths: paths.length,
      health: health.data?.status ?? health.data,
    }),
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
