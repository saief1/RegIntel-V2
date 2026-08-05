import { chunkText, contentHash } from './chunking.util';

describe('chunking.util', () => {
  it('hashes content', () => {
    expect(contentHash('abc')).toHaveLength(64);
    expect(contentHash('abc')).toBe(contentHash('abc'));
  });

  it('chunks long text with overlap-friendly pieces', () => {
    const text = Array.from(
      { length: 20 },
      (_, i) => `Paragraph ${i}. ${'x'.repeat(80)}`,
    ).join('\n\n');
    const chunks = chunkText(text, { maxChars: 200, overlapChars: 40 });
    expect(chunks.length).toBeGreaterThan(1);
    expect(chunks[0].index).toBe(0);
    expect(chunks[0].contentHash).toHaveLength(64);
  });

  it('returns empty for blank input', () => {
    expect(chunkText('   ')).toEqual([]);
  });
});
