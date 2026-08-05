import { validatePasswordPolicy } from './password-policy';

describe('password policy', () => {
  it('accepts a strong password', () => {
    expect(validatePasswordPolicy('ChangeMeAdmin123!').ok).toBe(true);
  });

  it('rejects short or simple passwords', () => {
    expect(validatePasswordPolicy('short1!A').ok).toBe(false);
    expect(validatePasswordPolicy('alllowercase123!').ok).toBe(false);
    expect(validatePasswordPolicy('NoSpecialChar12').ok).toBe(false);
    expect(validatePasswordPolicy('passwordPASSWORD1!').ok).toBe(false);
  });
});
