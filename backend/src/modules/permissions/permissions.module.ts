import { Module } from '@nestjs/common';
import { PermissionsGuard } from '../rbac/guards/permissions.guard';
import { PermissionsAdminService } from './permissions-admin.service';
import { PermissionsController } from './permissions.controller';
import { PermissionsService } from './permissions.service';

@Module({
  controllers: [PermissionsController],
  providers: [PermissionsService, PermissionsAdminService, PermissionsGuard],
  exports: [PermissionsService, PermissionsGuard],
})
export class PermissionsModule {}
