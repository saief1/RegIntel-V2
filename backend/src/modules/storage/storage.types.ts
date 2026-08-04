export type StorageProviderName = 'local' | 's3' | 'azure' | 'gcs';

export type StoredObjectRef = {
  provider: StorageProviderName;
  bucket?: string;
  objectKey: string;
  versionLabel: string;
};

export type UploadInput = {
  organizationId: string;
  filename: string;
  contentType: string;
  body: Buffer;
  objectKey?: string;
};

export type UploadResult = StoredObjectRef & {
  byteSize: number;
  checksumSha256: string;
};

export type SignedUrlResult = {
  url: string;
  expiresAt: string;
};

/**
 * Abstract object storage. Local is fully implemented; cloud providers
 * may fall back to local when credentials are absent.
 */
export interface StorageProvider {
  readonly name: StorageProviderName;
  upload(input: UploadInput): Promise<UploadResult>;
  download(ref: StoredObjectRef): Promise<Buffer>;
  delete(ref: StoredObjectRef): Promise<void>;
  getSignedUrl(
    ref: StoredObjectRef,
    expiresInSeconds?: number,
  ): Promise<SignedUrlResult>;
}

/** Placeholder hook for virus scanning integrations. */
export interface VirusScanHook {
  scan(buffer: Buffer, filename: string): Promise<'clean' | 'infected' | 'pending'>;
}

export class NoopVirusScanHook implements VirusScanHook {
  async scan(): Promise<'clean' | 'infected' | 'pending'> {
    return 'pending';
  }
}
