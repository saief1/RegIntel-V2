import { EmailService } from './email.service';
import { SYSTEM_EMAIL_TEMPLATES } from './email.types';

describe('EmailService helpers', () => {
  it('defines required system templates', () => {
    const keys = SYSTEM_EMAIL_TEMPLATES.map((t) => t.key);
    expect(keys).toEqual(
      expect.arrayContaining([
        'welcome',
        'password_reset',
        'mfa',
        'invitation',
        'task_assignment',
        'approval',
        'policy_review_reminder',
        'daily_digest',
        'weekly_digest',
        'security_alert',
      ]),
    );
  });

  it('defaults USE_REAL_EMAIL off', () => {
    const config = {
      get: (key: string) =>
        key === 'featureFlags.useRealEmail' ? false : undefined,
    };
    const service = new EmailService(
      {} as never,
      {
        name: 'console',
        send: () => Promise.resolve({ ok: true, provider: 'console' }),
        healthCheck: () => Promise.resolve('up' as const),
      },
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      config as never,
      {} as never,
    );
    expect(service.isRealEmailEnabled()).toBe(false);
    expect(service.resolveProviderName()).toBe('CONSOLE');
  });
});
