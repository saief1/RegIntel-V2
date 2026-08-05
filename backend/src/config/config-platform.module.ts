import { Global, Module } from '@nestjs/common';
import { ConfigPlatformService } from './config-platform.service';

@Global()
@Module({
  providers: [ConfigPlatformService],
  exports: [ConfigPlatformService],
})
export class ConfigPlatformModule {}
