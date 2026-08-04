import { SessionsService } from './sessions.service';

describe('SessionsService helpers', () => {
  it('exposes idle timeout seconds from config', () => {
    const prisma = {} as never;
    const configService = {
      getOrThrow: (key: string) => {
        if (key === 'sessionIdleTimeout') return '30m';
        if (key === 'refreshCookieName') return 'refresh_token';
        throw new Error(key);
      },
    } as never;
    const auditService = { record: jest.fn() } as never;
    const service = new SessionsService(prisma, configService, auditService);
    expect(service.getIdleTimeoutSeconds()).toBe(1800);
  });
});
