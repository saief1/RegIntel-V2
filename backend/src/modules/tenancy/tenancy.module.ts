import { Module } from '@nestjs/common';
import { TenancyController } from './tenancy.controller';
import { TenancyService } from './tenancy.service';
import { TenantRateLimitMiddleware } from './tenant-rate-limit.middleware';

@Module({
  controllers: [TenancyController],
  providers: [TenancyService, TenantRateLimitMiddleware],
  exports: [TenancyService, TenantRateLimitMiddleware],
})
export class TenancyModule {}
