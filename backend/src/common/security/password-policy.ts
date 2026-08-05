export type PasswordPolicyResult = {
  ok: boolean;
  errors: string[];
};

export const PASSWORD_POLICY = {
  minLength: 12,
  maxLength: 128,
  requireUppercase: true,
  requireLowercase: true,
  requireDigit: true,
  requireSpecial: true,
  specialPattern: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/,
} as const;

/**
 * Enterprise password policy (B023). Stricter than MinLength(8) used historically;
 * enforced on register + password change.
 */
export function validatePasswordPolicy(password: string): PasswordPolicyResult {
  const errors: string[] = [];
  if (password.length < PASSWORD_POLICY.minLength) {
    errors.push(
      `Password must be at least ${PASSWORD_POLICY.minLength} characters`,
    );
  }
  if (password.length > PASSWORD_POLICY.maxLength) {
    errors.push(
      `Password must be at most ${PASSWORD_POLICY.maxLength} characters`,
    );
  }
  if (PASSWORD_POLICY.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Password must include an uppercase letter');
  }
  if (PASSWORD_POLICY.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Password must include a lowercase letter');
  }
  if (PASSWORD_POLICY.requireDigit && !/\d/.test(password)) {
    errors.push('Password must include a digit');
  }
  if (
    PASSWORD_POLICY.requireSpecial &&
    !PASSWORD_POLICY.specialPattern.test(password)
  ) {
    errors.push('Password must include a special character');
  }
  if (/(.)\1{3,}/.test(password)) {
    errors.push('Password must not contain four identical characters in a row');
  }
  const lower = password.toLowerCase();
  for (const banned of ['password', 'regintel', 'qwerty', '123456']) {
    if (lower.includes(banned)) {
      errors.push(`Password must not contain common sequence "${banned}"`);
    }
  }
  return { ok: errors.length === 0, errors };
}
