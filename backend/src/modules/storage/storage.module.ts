import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LocalStorageProvider } from './providers/local.storage';
import { StorageController } from './storage.controller';
import {
  NoopVirusScanHook,
  STORAGE_PROVIDER,
  StorageService,
  VIRUS_SCAN_HOOK,
  createStorageProvider,
} from './storage.service';

@Module({
  controllers: [StorageController],
  providers: [
    LocalStorageProvider,
    {
      provide: STORAGE_PROVIDER,
      inject: [ConfigService, LocalStorageProvider],
      useFactory: (config: ConfigService, local: LocalStorageProvider) =>
        createStorageProvider(
          config.get<string>('storage.provider') ?? 'local',
          local,
        ),
    },
    { provide: VIRUS_SCAN_HOOK, useClass: NoopVirusScanHook },
    StorageService,
  ],
  exports: [StorageService, STORAGE_PROVIDER],
})
export class StorageModule {}
