import { SearchRepository } from './search.repository';

describe('SearchRepository highlighting', () => {
  it('ranks title matches above body-only matches', async () => {
    const prisma = {
      searchDocument: {
        count: jest.fn().mockResolvedValue(2),
        findMany: jest.fn().mockResolvedValue([
          {
            id: '1',
            organizationId: 'o',
            entityType: 'POLICY',
            entityId: 'a',
            title: 'Other',
            body: 'contains policy keyword',
            metadata: null,
            rankBoost: 1,
            indexedAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: '2',
            organizationId: 'o',
            entityType: 'POLICY',
            entityId: 'b',
            title: 'Policy handbook',
            body: 'general text',
            metadata: null,
            rankBoost: 1,
            indexedAt: new Date(),
            updatedAt: new Date(),
          },
        ]),
      },
    };
    const repo = new SearchRepository(prisma as never);
    const result = await repo.search({
      organizationId: 'o',
      q: 'policy',
      page: 1,
      pageSize: 10,
    });
    expect(result.data[0].title).toContain('Policy');
    expect(result.data[0].highlights.title).toContain('<mark>');
  });
});
