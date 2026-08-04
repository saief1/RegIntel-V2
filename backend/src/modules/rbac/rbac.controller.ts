import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiHeader,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Request } from 'express';
import { OrganizationGuard } from '../../common/guards/organization.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RequirePermissions } from './decorators/require-permissions.decorator';
import { AssignRoleDto } from './dto/assign-role.dto';
import { PermissionsGuard } from './guards/permissions.guard';
import { RbacService } from './rbac.service';

@ApiTags('rbac')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('rbac')
export class RbacController {
  constructor(private readonly rbacService: RbacService) {}

  @Get('roles')
  @ApiOperation({
    operationId: 'rbacListRoles',
    summary: 'List system roles and their permissions',
  })
  listRoles() {
    return this.rbacService.listRoles();
  }

  @Get('permissions')
  @ApiOperation({
    operationId: 'rbacListPermissions',
    summary: 'List database-driven permission catalog',
  })
  listPermissions() {
    return this.rbacService.listPermissions();
  }

  @Get('matrix')
  @ApiOperation({
    operationId: 'rbacPermissionMatrix',
    summary: 'Permission matrix (roles × permissions)',
  })
  matrix() {
    return this.rbacService.getPermissionMatrix();
  }

  @Patch('organizations/:organizationId/members/:userId/role')
  @UseGuards(OrganizationGuard, PermissionsGuard)
  @RequirePermissions('roles:manage')
  @ApiHeader({ name: 'X-Organization-Id', required: true })
  @ApiOperation({
    operationId: 'rbacAssignMemberRole',
    summary: 'Assign an AppRole to an organization member',
  })
  assignRole(
    @Req() req: Request,
    @Param('organizationId', new ParseUUIDPipe()) organizationId: string,
    @Param('userId', new ParseUUIDPipe()) userId: string,
    @Body() dto: AssignRoleDto,
  ) {
    if (req.organizationId !== organizationId) {
      throw new ForbiddenException({
        code: 'ORG_CONTEXT_MISMATCH',
        message:
          'X-Organization-Id must match the organization id in the path.',
      });
    }
    return this.rbacService.assignMemberRole({
      actorUserId: req.user!.userId,
      organizationId,
      targetUserId: userId,
      appRole: dto.appRole,
      req,
    });
  }
}
