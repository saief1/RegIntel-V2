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

  const passwordHistoryCount = await prisma.passwordHistory.count({
    where: { userId: user.id },
  });
  if (passwordHistoryCount === 0) {
    await prisma.passwordHistory.create({
      data: { userId: user.id, passwordHash },
    });
  }

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

  // ── Milestone B3 domain seed (idempotent by title lookup) ──
  const policyCount = await prisma.policy.count({
    where: { organizationId: organization.id },
  });
  let policyId: string | undefined;
  if (policyCount === 0) {
    const policy = await prisma.policy.create({
      data: {
        organizationId: organization.id,
        title: 'Information Security Policy',
        description: 'Baseline security controls for RegIntel Demo.',
        status: 'PUBLISHED',
        ownerName: name,
        category: 'Security',
        tags: ['security', 'baseline'],
      },
    });
    policyId = policy.id;
    await prisma.policyVersion.create({
      data: {
        policyId: policy.id,
        version: 1,
        title: policy.title,
        content: '# Information Security Policy\n\nDemo seeded content.',
        changeNotes: 'Initial seed',
        createdById: user.id,
      },
    });
  }

  const caseCount = await prisma.case.count({
    where: { organizationId: organization.id },
  });
  let caseId: string | undefined;
  if (caseCount === 0) {
    const demoCase = await prisma.case.create({
      data: {
        organizationId: organization.id,
        title: 'Vendor risk follow-up',
        summary: 'Seeded case for API demos.',
        status: 'OPEN',
        priority: 'high',
        ownerId: user.id,
        tags: ['vendor', 'risk'],
      },
    });
    caseId = demoCase.id;
  } else {
    const existingCase = await prisma.case.findFirst({
      where: { organizationId: organization.id, deletedAt: null },
    });
    caseId = existingCase?.id;
  }

  const taskCount = await prisma.task.count({
    where: { organizationId: organization.id },
  });
  let taskId: string | undefined;
  if (taskCount === 0) {
    const task = await prisma.task.create({
      data: {
        organizationId: organization.id,
        caseId,
        title: 'Collect residual risk attestation',
        description: 'Seeded task for notification and work APIs.',
        status: 'TODO',
        priority: 'high',
        assigneeId: user.id,
        createdById: user.id,
        dueAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        tags: ['attestation'],
      },
    });
    taskId = task.id;
  } else {
    const existingTask = await prisma.task.findFirst({
      where: { organizationId: organization.id, deletedAt: null },
    });
    taskId = existingTask?.id;
  }

  const docCount = await prisma.knowledgeDocument.count({
    where: { organizationId: organization.id },
  });
  if (docCount === 0) {
    await prisma.knowledgeDocument.create({
      data: {
        organizationId: organization.id,
        title: 'Control Library Overview',
        summary: 'Seeded knowledge document.',
        body: 'Demo knowledge content for B3 APIs.',
        collection: 'controls',
        tags: ['knowledge'],
      },
    });
  }

  const reportCount = await prisma.report.count({
    where: { organizationId: organization.id },
  });
  if (reportCount === 0) {
    await prisma.report.create({
      data: {
        organizationId: organization.id,
        title: 'Monthly compliance digest',
        description: 'Seeded report.',
        reportType: 'compliance_digest',
        status: 'READY',
        parameters: { period: '2026-07' },
        generatedAt: new Date(),
      },
    });
  }

  const workflowCount = await prisma.workflow.count({
    where: { organizationId: organization.id },
  });
  if (workflowCount === 0) {
    await prisma.workflow.create({
      data: {
        organizationId: organization.id,
        name: 'Policy review cycle',
        description: 'Seeded workflow definition.',
        status: 'ACTIVE',
        definition: {
          trigger: 'policy.published',
          steps: [{ type: 'notify', role: 'COMPLIANCE_OFFICER' }],
        },
      },
    });
  }

  const notifCount = await prisma.notification.count({
    where: { organizationId: organization.id, userId: user.id },
  });
  if (notifCount === 0) {
    await prisma.notification.createMany({
      data: [
        {
          organizationId: organization.id,
          userId: user.id,
          kind: 'ASSIGNMENT',
          channel: 'IN_APP',
          title: 'Assigned to you',
          body: 'Collect residual risk attestation was assigned to you.',
          groupLabel: 'Tasks',
          taskId,
          caseId,
          href: taskId ? `/work/tasks/${taskId}` : '/work',
        },
        {
          organizationId: organization.id,
          userId: user.id,
          kind: 'POLICY_REVIEW',
          channel: 'IN_APP',
          title: 'Policy review due',
          body: 'Information Security Policy is due for periodic review.',
          groupLabel: 'Policies',
          href: policyId ? `/governance/policies/${policyId}` : '/governance',
        },
        {
          organizationId: organization.id,
          userId: user.id,
          kind: 'SECURITY_ALERT',
          channel: 'IN_APP',
          title: 'Security alert',
          body: 'Multiple failed login attempts detected (seed demo).',
          groupLabel: 'Security',
          href: '/settings/security',
        },
      ],
    });
  }

  await prisma.notificationPreference.upsert({
    where: {
      organizationId_userId: {
        organizationId: organization.id,
        userId: user.id,
      },
    },
    update: {},
    create: {
      organizationId: organization.id,
      userId: user.id,
      inAppEnabled: true,
      emailEnabled: true,
      digestEnabled: false,
      digestHourUtc: 8,
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
      domainSeed: {
        policies: await prisma.policy.count({
          where: { organizationId: organization.id },
        }),
        tasks: await prisma.task.count({
          where: { organizationId: organization.id },
        }),
        cases: await prisma.case.count({
          where: { organizationId: organization.id },
        }),
        notifications: await prisma.notification.count({
          where: { organizationId: organization.id },
        }),
      },
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
