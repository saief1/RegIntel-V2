import { Module } from '@nestjs/common';
import { PermissionsModule } from '../permissions/permissions.module';
import { PermissionsGuard } from './guards/permissions.guard';
import { RbacController } from './rbac.controller';
import { RbacService } from './rbac.service';

@Module({
  imports: [PermissionsModule],
  controllers: [RbacController],
  providers: [RbacService, PermissionsGuard],
  exports: [RbacService, PermissionsGuard, PermissionsModule],
})
export class RbacModule {}
