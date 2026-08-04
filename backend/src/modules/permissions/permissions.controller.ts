import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
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
import { RequirePermissions } from '../rbac/decorators/require-permissions.decorator';
import { PermissionsGuard } from '../rbac/guards/permissions.guard';
import {
  CheckPermissionDto,
  CreatePermissionGrantDto,
} from './dto/permission-grant.dto';
import { PermissionsAdminService } from './permissions-admin.service';

@ApiTags('permissions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, OrganizationGuard)
@ApiHeader({ name: 'X-Organization-Id', required: true })
@Controller('permissions')
export class PermissionsController {
  constructor(private readonly admin: PermissionsAdminService) {}

  @Get('me')
  @ApiOperation({
    operationId: 'permissionsMe',
    summary: 'Effective permissions for the current user in org context',
  })
  me(@Req() req: Request) {
    return this.admin.getMyEffective(req.user!.userId, req.organizationId!);
  }

  @Get('check')
  @ApiOperation({
    operationId: 'permissionsCheck',
    summary: 'Check whether the current user has a permission',
  })
  check(@Req() req: Request, @Query() query: CheckPermissionDto) {
    return this.admin.check(
      req.user!.userId,
      req.organizationId!,
      query.permission,
      query.resourceType,
      query.resourceId,
    );
  }

  @Get('grants')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('roles:manage')
  @ApiOperation({
    operationId: 'permissionsListGrants',
    summary: 'List organization/team/resource permission grants',
  })
  listGrants(@Req() req: Request) {
    return this.admin.listGrants(req.organizationId!);
  }

  @Post('grants')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('roles:manage')
  @ApiOperation({
    operationId: 'permissionsCreateGrant',
    summary: 'Create an organization, team, or resource permission grant',
  })
  createGrant(@Req() req: Request, @Body() dto: CreatePermissionGrantDto) {
    return this.admin.createGrant(
      req.organizationId!,
      req.user!.userId,
      dto,
      req,
    );
  }

  @Delete('grants/:grantId')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('roles:manage')
  @ApiOperation({
    operationId: 'permissionsDeleteGrant',
    summary: 'Delete a permission grant',
  })
  deleteGrant(
    @Req() req: Request,
    @Param('grantId', new ParseUUIDPipe()) grantId: string,
  ) {
    return this.admin.deleteGrant(
      req.organizationId!,
      grantId,
      req.user!.userId,
      req,
    );
  }
}
