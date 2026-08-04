import { PasswordService } from './password.service';

describe('PasswordService', () => {
  const service = new PasswordService();

  it('hashes and verifies passwords with Argon2', async () => {
    const hash = await service.hash('SecurePass123!');
    expect(hash).not.toEqual('SecurePass123!');
    await expect(service.verify(hash, 'SecurePass123!')).resolves.toBe(true);
    await expect(service.verify(hash, 'wrong-password')).resolves.toBe(false);
  });
});
