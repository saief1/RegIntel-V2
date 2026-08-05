import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash, randomUUID } from 'crypto';
import { mkdir, readFile, unlink, writeFile } from 'fs/promises';
import { dirname, join } from 'path';
import {
  SignedUrlResult,
  StoredObjectRef,
  StorageProvider,
  UploadInput,
  UploadResult,
} from '../storage.types';

@Injectable()
export class LocalStorageProvider implements StorageProvider {
  readonly name = 'local' as const;
  private readonly logger = new Logger(LocalStorageProvider.name);
  private readonly root: string;

  constructor(private readonly configService: ConfigService) {
    this.root =
      this.configService.get<string>('storage.localRoot') ??
      join(process.cwd(), 'storage');
  }

  private resolvePath(ref: StoredObjectRef): string {
    return join(this.root, ref.objectKey, `v-${ref.versionLabel}`);
  }

  async upload(input: UploadInput): Promise<UploadResult> {
    const objectKey =
      input.objectKey ??
      `${input.organizationId}/${new Date().toISOString().slice(0, 10)}/${randomUUID()}-${input.filename}`;
    const versionLabel = '1';
    const ref: StoredObjectRef = {
      provider: 'local',
      objectKey,
      versionLabel,
    };
    const path = this.resolvePath(ref);
    await mkdir(dirname(path), { recursive: true });
    await writeFile(path, input.body);
    const checksumSha256 = createHash('sha256')
      .update(input.body)
      .digest('hex');
    this.logger.debug(`Stored object at ${path}`);
    return {
      ...ref,
      byteSize: input.body.byteLength,
      checksumSha256,
    };
  }

  async download(ref: StoredObjectRef): Promise<Buffer> {
    return readFile(this.resolvePath(ref));
  }

  async delete(ref: StoredObjectRef): Promise<void> {
    try {
      await unlink(this.resolvePath(ref));
    } catch {
      // idempotent delete
    }
  }

  async getSignedUrl(
    ref: StoredObjectRef,
    expiresInSeconds = 3600,
  ): Promise<SignedUrlResult> {
    const expiresAt = new Date(
      Date.now() + expiresInSeconds * 1000,
    ).toISOString();
    // Local provider returns an internal API download path tokenized by key.
    const token = Buffer.from(
      JSON.stringify({ ...ref, exp: expiresAt }),
    ).toString('base64url');
    return {
      url: `/api/v1/storage/signed/${token}`,
      expiresAt,
    };
  }
}
