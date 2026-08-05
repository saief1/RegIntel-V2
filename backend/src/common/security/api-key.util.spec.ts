import { generateApiKey, hashApiKey, verifyApiKey } from './api-key.util';

describe('api key utils', () => {
  it('generates, hashes, and verifies keys', () => {
    const { raw, prefix, hash } = generateApiKey();
    expect(raw.startsWith(`rik_${prefix}_`)).toBe(true);
    expect(hash).toBe(hashApiKey(raw));
    expect(verifyApiKey(raw, hash)).toBe(true);
    expect(verifyApiKey(`${raw}x`, hash)).toBe(false);
  });
});
