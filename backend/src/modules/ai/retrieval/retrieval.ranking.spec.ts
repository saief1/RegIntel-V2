import { cosineSimilarity, keywordBoost } from '../vector/vector.types';

describe('retrieval hybrid ranking helpers', () => {
  it('boosts keyword overlap', () => {
    const content =
      'FINTRAC travel rule guidance for virtual asset service providers';
    expect(keywordBoost(content, 'travel rule FINTRAC')).toBeGreaterThan(0);
    expect(keywordBoost(content, 'unrelated quantum physics')).toBe(0);
  });

  it('scores identical vectors highest', () => {
    const a = [0.1, 0.2, 0.3, 0.4];
    expect(cosineSimilarity(a, a)).toBeCloseTo(1, 5);
    expect(cosineSimilarity(a, [0, 0, 0, 0])).toBe(0);
  });
});
