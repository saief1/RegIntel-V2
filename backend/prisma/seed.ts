import { PrismaClient } from '@prisma/client';
import { argon2id, hash } from 'argon2';

const prisma = new PrismaClient();

async function main() {
  const email = (process.env.SEED_ADMIN_EMAIL ?? 'admin@regintel.local').toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD ?? 'ChangeMeAdmin123!';
  const name = process.env.SEED_ADMIN_NAME ?? 'RegIntel Admin';
  const orgName = process.env.SEED_ORG_NAME ?? 'RegIntel Demo';
  const orgSlug = process.env.SEED_ORG_SLUG ?? 'regintel-demo';

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
    },
    create: {
      email,
      name,
      passwordHash,
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
      status: 'ACTIVE',
    },
    create: {
      userId: user.id,
      organizationId: organization.id,
      role: 'OWNER',
      status: 'ACTIVE',
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
