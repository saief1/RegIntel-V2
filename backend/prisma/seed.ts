import { PrismaClient } from '@prisma/client';
import { argon2id, hash } from 'argon2';
import {
  PERMISSION_CATALOG,
  ROLE_DEFINITIONS,
  ROLE_PERMISSION_MATRIX,
  legacyRoleToAppRole,
} from '../src/modules/rbac/rbac.constants';

const prisma = new PrismaClient();

async function seedRbac() {
  for (const permission of PERMISSION_CATALOG) {
    await prisma.permission.upsert({
      where: { key: permission.key },
      update: {
        name: permission.name,
        description: permission.description,
        category: permission.category,
      },
      create: permission,
    });
  }

  const permissionRows = await prisma.permission.findMany();
  const byKey = new Map(permissionRows.map((row) => [row.key, row.id]));

  for (const role of ROLE_DEFINITIONS) {
    const roleRow = await prisma.role.upsert({
      where: { key: role.key },
      update: {
        name: role.name,
        description: role.description,
        isSystem: true,
      },
      create: {
        key: role.key,
        name: role.name,
        description: role.description,
        isSystem: true,
      },
    });

    const keys = ROLE_PERMISSION_MATRIX[role.key];
    for (const key of keys) {
      const permissionId = byKey.get(key);
      if (!permissionId) {
        continue;
      }
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: roleRow.id,
            permissionId,
          },
        },
        update: {},
        create: {
          roleId: roleRow.id,
          permissionId,
        },
      });
    }
  }
}

async function main() {
  const email = (
    process.env.SEED_ADMIN_EMAIL ?? 'admin@regintel.local'
  ).toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD ?? 'ChangeMeAdmin123!';
  const name = process.env.SEED_ADMIN_NAME ?? 'RegIntel Admin';
  const orgName = process.env.SEED_ORG_NAME ?? 'RegIntel Demo';
  const orgSlug = process.env.SEED_ORG_SLUG ?? 'regintel-demo';

  await seedRbac();

  const passwordHash = await hash(password, {
    type: argon2id,
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 1,
  });

  const organization = await prisma.organization.upsert({
    where: { slug: orgSlug },
    update: { name: orgName },
    create: { name: orgName, slug: orgSlug },
  });

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      name,
      passwordHash,
      isSuperAdmin: true,
      active: true,
    },
    create: {
      email,
      name,
      passwordHash,
      isSuperAdmin: true,
      active: true,
    },
  });

  await prisma.organizationMembership.upsert({
    where: {
      userId_organizationId: {
        userId: user.id,
        organizationId: organization.id,
      },
    },
    update: {
      role: 'OWNER',
      appRole: 'ORG_ADMIN',
      status: 'ACTIVE',
    },
    create: {
      userId: user.id,
      organizationId: organization.id,
      role: 'OWNER',
      appRole: 'ORG_ADMIN',
      status: 'ACTIVE',
    },
  });

  // Backfill appRole for any legacy memberships.
  const memberships = await prisma.organizationMembership.findMany();
  for (const membership of memberships) {
    if (membership.appRole === 'VIEWER' && membership.role !== 'MEMBER') {
      await prisma.organizationMembership.update({
        where: { id: membership.id },
        data: { appRole: legacyRoleToAppRole(membership.role) },
      });
    }
  }

  await prisma.ssoConfiguration.upsert({
    where: {
      organizationId_providerType_name: {
        organizationId: organization.id,
        providerType: 'OIDC',
        name: 'Mock Okta OIDC',
      },
    },
    update: {},
    create: {
      organizationId: organization.id,
      providerType: 'OIDC',
      name: 'Mock Okta OIDC',
      enabled: false,
      issuer: 'https://mock-okta.regintel.local',
      clientId: 'regintel-mock-oidc',
      authorizationUrl:
        'https://mock-okta.regintel.local/oauth2/v1/authorize',
      tokenUrl: 'https://mock-okta.regintel.local/oauth2/v1/token',
      jwksUrl: 'https://mock-okta.regintel.local/oauth2/v1/keys',
      scopes: 'openid profile email',
      configJson: { provider: 'okta', mode: 'mock' },
    },
  });

  await prisma.ssoConfiguration.upsert({
    where: {
      organizationId_providerType_name: {
        organizationId: organization.id,
        providerType: 'SAML',
        name: 'Mock Azure AD SAML',
      },
    },
    update: {},
    create: {
      organizationId: organization.id,
      providerType: 'SAML',
      name: 'Mock Azure AD SAML',
      enabled: false,
      entityId: 'https://auth.regintel.local/saml/metadata',
      acsUrl: 'https://app.regintel.local/sso/saml/acs',
      metadataUrl: 'https://mock-azure.regintel.local/saml/sso',
      certificate: 'MOCK-CERTIFICATE',
      configJson: {
        provider: 'azuread',
        mode: 'mock',
        ssoUrl: 'https://mock-azure.regintel.local/saml/sso',
      },
    },
  });

  // eslint-disable-next-line no-console
  console.log(
    JSON.stringify({
      seeded: true,
      adminEmail: email,
      organizationId: organization.id,
      organizationSlug: organization.slug,
      userId: user.id,
      isSuperAdmin: true,
      appRole: 'ORG_ADMIN',
      rbacPermissions: PERMISSION_CATALOG.length,
    }),
  );
}

main()
  .catch((error: unknown) => {
    // eslint-disable-next-line no-console
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
