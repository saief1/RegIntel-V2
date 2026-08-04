import { Logger } from '@nestjs/common';
import { LocalStorageProvider } from './local.storage';
import {
  SignedUrlResult,
  StoredObjectRef,
  StorageProvider,
  StorageProviderName,
  UploadInput,
  UploadResult,
} from '../storage.types';

/**
 * Cloud provider stubs. Without credentials they delegate to LocalStorageProvider
 * so development and CI always have a working path.
 */
export class CloudStorageStub implements StorageProvider {
  private readonly logger = new Logger(CloudStorageStub.name);

  constructor(
    readonly name: StorageProviderName,
    private readonly local: LocalStorageProvider,
    private readonly credentialsPresent: boolean,
  ) {}

  private ensureFallback(op: string): void {
    if (!this.credentialsPresent) {
      this.logger.warn(
        `${this.name.toUpperCase()} credentials absent — falling back to local storage for ${op}`,
      );
    } else {
      this.logger.warn(
        `${this.name.toUpperCase()} SDK not wired in B3 — falling back to local storage for ${op}`,
      );
    }
  }

  async upload(input: UploadInput): Promise<UploadResult> {
    this.ensureFallback('upload');
    const result = await this.local.upload(input);
    return { ...result, provider: this.name };
  }

  async download(ref: StoredObjectRef): Promise<Buffer> {
    this.ensureFallback('download');
    return this.local.download({ ...ref, provider: 'local' });
  }

  async delete(ref: StoredObjectRef): Promise<void> {
    this.ensureFallback('delete');
    return this.local.delete({ ...ref, provider: 'local' });
  }

  async getSignedUrl(
    ref: StoredObjectRef,
    expiresInSeconds?: number,
  ): Promise<SignedUrlResult> {
    this.ensureFallback('signedUrl');
    return this.local.getSignedUrl(
      { ...ref, provider: 'local' },
      expiresInSeconds,
    );
  }
}

export function hasS3Credentials(): boolean {
  return Boolean(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_S3_BUCKET);
}

export function hasAzureCredentials(): boolean {
  return Boolean(
    process.env.AZURE_STORAGE_CONNECTION_STRING ||
      process.env.AZURE_STORAGE_ACCOUNT,
  );
}

export function hasGcsCredentials(): boolean {
  return Boolean(
    process.env.GCS_BUCKET &&
      (process.env.GOOGLE_APPLICATION_CREDENTIALS ||
        process.env.GCS_CLIENT_EMAIL),
  );
}
