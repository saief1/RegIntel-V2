import { redactSecrets, sanitizeDeep, sanitizeText } from './sanitize';

describe('sanitize', () => {
  it('strips script tags and event handlers', () => {
    const dirty = '<script>alert(1)</script>Hello <img src=x onerror=alert(1)>';
    const clean = sanitizeText(dirty);
    expect(clean.toLowerCase()).not.toContain('<script');
    expect(clean.toLowerCase()).not.toContain('onerror');
    expect(clean).toContain('Hello');
  });

  it('sanitizes nested objects', () => {
    const out = sanitizeDeep({
      title: '<script>alert(1)</script>Policy',
      nested: { note: 'javascript:alert(1)' },
    });
    expect(out.title.toLowerCase()).not.toContain('<script');
    expect(out.title).toContain('Policy');
    expect(out.nested.note.toLowerCase()).not.toContain('javascript:');
  });

  it('redacts secret-looking keys', () => {
    const out = redactSecrets({
      password: 'secret',
      apiKey: 'abc',
      name: 'Ada',
    });
    expect(out.password).toBe('[REDACTED]');
    expect(out.apiKey).toBe('[REDACTED]');
    expect(out.name).toBe('Ada');
  });
});
