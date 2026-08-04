import {
  base32Decode,
  base32Encode,
  buildOtpAuthUrl,
  generateTotp,
  generateTotpSecret,
  verifyTotp,
} from './totp.util';

describe('totp.util', () => {
  it('round-trips base32 encoding', () => {
    const raw = Buffer.from('HelloRegIntel!!');
    expect(base32Decode(base32Encode(raw)).equals(raw)).toBe(true);
  });

  it('generates and verifies TOTP codes', () => {
    const secret = generateTotpSecret();
    const code = generateTotp(secret, 1_700_000_000_000);
    expect(code).toMatch(/^\d{6}$/);
    expect(
      verifyTotp(secret, code, { timeMs: 1_700_000_000_000, window: 0 }),
    ).toBe(true);
    expect(
      verifyTotp(secret, '000000', { timeMs: 1_700_000_000_000, window: 0 }),
    ).toBe(false);
  });

  it('builds otpauth URLs', () => {
    const url = buildOtpAuthUrl({
      secret: 'JBSWY3DPEHPK3PXP',
      accountName: 'admin@regintel.local',
      issuer: 'RegIntel',
    });
    expect(url).toContain('otpauth://totp/');
    expect(url).toContain('secret=JBSWY3DPEHPK3PXP');
    expect(url).toContain('issuer=RegIntel');
  });
});
