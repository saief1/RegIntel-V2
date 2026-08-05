import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { AttachmentOwnerType, StorageProviderType } from '@prisma/client';
import { AuditService } from '../../common/audit/audit.service';
import { IStorageObjectRepository } from '../../common/repositories/storage-object.repository';
import { STORAGE_OBJECT_REPOSITORY } from '../../common/repositories/tokens';
import {
  CloudStorageStub,
  hasAzureCredentials,
  hasGcsCredentials,
  hasS3Credentials,
} from './providers/cloud.storage';
import { LocalStorageProvider } from './providers/local.storage';
import {
  NoopVirusScanHook,
  StorageProvider,
  VirusScanHook,
} from './storage.types';
import { validateUploadFile } from './storage.validation';

export const STORAGE_PROVIDER = Symbol('STORAGE_PROVIDER');
export const VIRUS_SCAN_HOOK = Symbol('VIRUS_SCAN_HOOK');

@Injectable()
export class StorageService {
  constructor(
    @Inject(STORAGE_PROVIDER)
    private readonly provider: StorageProvider,
    @Inject(STORAGE_OBJECT_REPOSITORY)
    private readonly storageRepo: IStorageObjectRepository,
    @Inject(VIRUS_SCAN_HOOK)
    private readonly virusScan: VirusScanHook,
    private readonly auditService: AuditService,
  ) {}

  list(organizationId: string, page?: number, pageSize?: number) {
    return this.storageRepo.list({ organizationId, page, pageSize });
  }

  async upload(
    organizationId: string,
    userId: string,
    file: {
      originalname: string;
      mimetype: string;
      size: number;
      buffer: Buffer;
    },
    opts?: {
      ownerType?: AttachmentOwnerType;
      ownerId?: string;
      label?: string;
    },
  ) {
    validateUploadFile(file);
    const scanStatus = await this.virusScan.scan(
      file.buffer,
      file.originalname,
    );
    const uploaded = await this.provider.upload({
      organizationId,
      filename: file.originalname,
      contentType: file.mimetype,
      body: file.buffer,
    });

    const providerType = uploaded.provider.toUpperCase() as StorageProviderType;
    const object = await this.storageRepo.create({
      organizationId,
      provider: providerType,
      bucket: uploaded.bucket,
      objectKey: uploaded.objectKey,
      filename: file.originalname,
      contentType: file.mimetype,
      byteSize: uploaded.byteSize,
      checksumSha256: uploaded.checksumSha256,
      versionLabel: uploaded.versionLabel,
      virusScanStatus: scanStatus,
    });

    let attachment = null;
    if (opts?.ownerType && opts.ownerId) {
      attachment = await this.storageRepo.createAttachment({
        organizationId,
        storageObjectId: object.id,
        ownerType: opts.ownerType,
        ownerId: opts.ownerId,
        label: opts.label,
      });
    }

    await this.auditService.record({
      action: 'storage.upload',
      resource: `storage:${object.id}`,
      userId,
      organizationId,
      after: { filename: object.filename, byteSize: object.byteSize },
    });

    return { object, attachment };
  }

  async get(organizationId: string, id: string) {
    const object = await this.storageRepo.findById(organizationId, id);
    if (!object) {
      throw new NotFoundException({
        code: 'STORAGE_OBJECT_NOT_FOUND',
        message: 'Storage object not found.',
      });
    }
    return object;
  }

  async download(organizationId: string, id: string) {
    const object = await this.get(organizationId, id);
    const buffer = await this.provider.download({
      provider: object.provider.toLowerCase() as 'local',
      bucket: object.bucket ?? undefined,
      objectKey: object.objectKey,
      versionLabel: object.versionLabel,
    });
    return { object, buffer };
  }

  async signedUrl(organizationId: string, id: string, expiresInSeconds = 3600) {
    const object = await this.get(organizationId, id);
    return this.provider.getSignedUrl(
      {
        provider: object.provider.toLowerCase() as 'local',
        bucket: object.bucket ?? undefined,
        objectKey: object.objectKey,
        versionLabel: object.versionLabel,
      },
      expiresInSeconds,
    );
  }

  async remove(organizationId: string, userId: string, id: string) {
    const object = await this.get(organizationId, id);
    await this.provider.delete({
      provider: object.provider.toLowerCase() as 'local',
      bucket: object.bucket ?? undefined,
      objectKey: object.objectKey,
      versionLabel: object.versionLabel,
    });
    await this.storageRepo.softDelete(organizationId, id);
    await this.auditService.record({
      action: 'storage.delete',
      resource: `storage:${id}`,
      userId,
      organizationId,
    });
    return { id, deleted: true };
  }

  listAttachments(
    organizationId: string,
    ownerType: AttachmentOwnerType,
    ownerId: string,
  ) {
    return this.storageRepo.listAttachments(organizationId, ownerType, ownerId);
  }
}

export function createStorageProvider(
  name: string,
  local: LocalStorageProvider,
): StorageProvider {
  switch ((name || 'local').toLowerCase()) {
    case 's3':
      return new CloudStorageStub('s3', local, hasS3Credentials());
    case 'azure':
      return new CloudStorageStub('azure', local, hasAzureCredentials());
    case 'gcs':
      return new CloudStorageStub('gcs', local, hasGcsCredentials());
    default:
      return local;
  }
}

export { NoopVirusScanHook };
