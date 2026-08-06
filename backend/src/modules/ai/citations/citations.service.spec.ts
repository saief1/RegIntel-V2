import { CitationsService } from './citations.service';

describe('CitationsService', () => {
  const service = Object.create(CitationsService.prototype) as CitationsService;

  it('maps DB citations to workspace shape', () => {
    const mapped = service.toWorkspaceCitations([
      {
        id: 'c1',
        kind: 'regulation',
        title: 'Travel Rule',
        subtitle: 'GUIDANCE · chunk 0',
        href: '/knowledge/library/x',
        snippet: 'FINTRAC…',
      },
      {
        id: 'c2',
        kind: 'weird',
        title: 'Other',
        subtitle: null,
        href: null,
        snippet: null,
      },
    ]);
    expect(mapped[0]).toMatchObject({
      id: 'c1',
      kind: 'regulation',
      title: 'Travel Rule',
      href: '/knowledge/library/x',
    });
    expect(mapped[1].kind).toBe('document');
    expect(mapped[1].href).toBe('#');
  });
});
