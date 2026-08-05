import { cosineSimilarity, keywordBoost } from './vector.types';

describe('vector.types helpers', () => {
  it('computes cosine similarity', () => {
    expect(cosineSimilarity([1, 0], [1, 0])).toBeCloseTo(1);
    expect(cosineSimilarity([1, 0], [0, 1])).toBeCloseTo(0);
  });

  it('boosts keyword matches lightly', () => {
    expect(
      keywordBoost('travel rule fintrac guidance', 'FINTRAC travel'),
    ).toBeGreaterThan(0);
    expect(keywordBoost('unrelated', 'zzz')).toBe(0);
  });
});
