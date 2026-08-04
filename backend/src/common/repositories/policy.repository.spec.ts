import { PolicyRepository } from './policy.repository';

describe('PolicyRepository', () => {
  const prisma = {
    policy: {
      count: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    policyVersion: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
  };

  const repo = new PolicyRepository(prisma as never);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('lists policies with pagination meta', async () => {
    prisma.policy.count.mockResolvedValue(1);
    prisma.policy.findMany.mockResolvedValue([
      { id: 'p1', title: 'Policy', organizationId: 'org1' },
    ]);

    const result = await repo.list({
      organizationId: 'org1',
      page: 1,
      pageSize: 20,
    });

    expect(result.data).toHaveLength(1);
    expect(result.meta.total).toBe(1);
    expect(prisma.policy.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          organizationId: 'org1',
          deletedAt: null,
        }),
      }),
    );
  });

  it('soft deletes by setting deletedAt', async () => {
    prisma.policy.findFirst.mockResolvedValue({
      id: 'p1',
      organizationId: 'org1',
      version: 1,
    });
    prisma.policy.update.mockResolvedValue({
      id: 'p1',
      deletedAt: new Date(),
    });

    const deleted = await repo.softDelete('org1', 'p1');
    expect(deleted?.id).toBe('p1');
    expect(prisma.policy.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ deletedAt: expect.any(Date) }),
      }),
    );
  });

  it('rejects update on version conflict', async () => {
    prisma.policy.findFirst.mockResolvedValue({
      id: 'p1',
      organizationId: 'org1',
      version: 2,
    });

    const updated = await repo.update('org1', 'p1', {
      title: 'X',
      expectedVersion: 1,
    });
    expect(updated).toBeNull();
    expect(prisma.policy.update).not.toHaveBeenCalled();
  });
});
