import { mkdtemp, rm } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';
import { LocalStorageProvider } from './local.storage';

describe('LocalStorageProvider', () => {
  let root: string;
  let provider: LocalStorageProvider;

  beforeEach(async () => {
    root = await mkdtemp(join(tmpdir(), 'regintel-storage-'));
    provider = new LocalStorageProvider({
      get: (key: string) =>
        key === 'storage.localRoot' ? root : undefined,
    } as never);
  });

  afterEach(async () => {
    await rm(root, { recursive: true, force: true });
  });

  it('uploads, downloads, signs, and deletes', async () => {
    const uploaded = await provider.upload({
      organizationId: 'org-1',
      filename: 'note.txt',
      contentType: 'text/plain',
      body: Buffer.from('hello-storage'),
    });

    expect(uploaded.byteSize).toBe(13);
    expect(uploaded.checksumSha256).toHaveLength(64);

    const bytes = await provider.download(uploaded);
    expect(bytes.toString('utf8')).toBe('hello-storage');

    const signed = await provider.getSignedUrl(uploaded, 60);
    expect(signed.url).toContain('/api/v1/storage/signed/');
    expect(signed.expiresAt).toBeTruthy();

    await provider.delete(uploaded);
  });
});
