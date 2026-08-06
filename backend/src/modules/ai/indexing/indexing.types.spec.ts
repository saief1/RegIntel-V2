import { citationKindForEntity, ENTITY_HREF } from './indexing.types';

describe('indexing.types', () => {
  it('maps entity types to citation kinds', () => {
    expect(citationKindForEntity('REGULATION')).toBe('regulation');
    expect(citationKindForEntity('GUIDANCE')).toBe('regulation');
    expect(citationKindForEntity('CASE')).toBe('case');
    expect(citationKindForEntity('EVIDENCE')).toBe('evidence');
    expect(citationKindForEntity('POLICY')).toBe('document');
  });

  it('builds hrefs for common entity types', () => {
    expect(ENTITY_HREF.POLICY?.('abc')).toContain('/governance/policies/abc');
    expect(ENTITY_HREF.CASE?.('xyz')).toContain('/cases/xyz');
  });
});
