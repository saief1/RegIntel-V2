import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
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
  ScimConfigDto,
  ScimGroupDto,
  ScimMappingDto,
  ScimUserDto,
} from './dto/scim.dto';
import { ScimService } from './scim.service';

@ApiTags('scim')
@Controller('scim')
export class ScimController {
  constructor(private readonly scimService: ScimService) {}

  @Get('configuration')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, OrganizationGuard, PermissionsGuard)
  @RequirePermissions('security:read')
  @ApiHeader({ name: 'X-Organization-Id', required: true })
  @ApiOperation({
    operationId: 'scimGetConfiguration',
    summary: 'Get SCIM provisioning configuration',
  })
  getConfig(@Req() req: Request) {
    return this.scimService.getConfiguration(req.organizationId!);
  }

  @Put('configuration')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, OrganizationGuard, PermissionsGuard)
  @RequirePermissions('scim:manage')
  @ApiHeader({ name: 'X-Organization-Id', required: true })
  @ApiOperation({
    operationId: 'scimUpsertConfiguration',
    summary: 'Create or update SCIM configuration',
  })
  putConfig(@Req() req: Request, @Body() dto: ScimConfigDto) {
    return this.scimService.upsertConfiguration(
      req.organizationId!,
      req.user!.userId,
      dto,
      req,
    );
  }

  @Get('status')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, OrganizationGuard, PermissionsGuard)
  @RequirePermissions('security:read')
  @ApiHeader({ name: 'X-Organization-Id', required: true })
  @ApiOperation({
    operationId: 'scimSyncStatus',
    summary: 'SCIM sync status for the organization',
  })
  status(@Req() req: Request) {
    return this.scimService.getSyncStatus(req.organizationId!);
  }

  @Get('mappings')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, OrganizationGuard, PermissionsGuard)
  @RequirePermissions('security:read')
  @ApiHeader({ name: 'X-Organization-Id', required: true })
  @ApiOperation({
    operationId: 'scimListMappings',
    summary: 'List SCIM group → AppRole mappings',
  })
  mappings(@Req() req: Request) {
    return this.scimService.getMappings(req.organizationId!);
  }

  @Put('mappings')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, OrganizationGuard, PermissionsGuard)
  @RequirePermissions('scim:manage')
  @ApiHeader({ name: 'X-Organization-Id', required: true })
  @ApiOperation({
    operationId: 'scimSetMapping',
    summary: 'Set SCIM group → AppRole mapping',
  })
  setMapping(@Req() req: Request, @Body() dto: ScimMappingDto) {
    return this.scimService.setMapping(
      req.organizationId!,
      dto,
      req.user!.userId,
      req,
    );
  }

  // --- SCIM 2.0 REST (bearer token auth) ---

  @Get('v2/Users')
  @ApiHeader({ name: 'X-Organization-Id', required: true })
  @ApiOperation({
    operationId: 'scimListUsers',
    summary: 'SCIM 2.0 list users',
  })
  async listUsers(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-organization-id') organizationId: string,
  ) {
    await this.scimService.assertScimBearer(organizationId, authorization);
    return this.scimService.listUsers(organizationId);
  }

  @Get('v2/Users/:id')
  @ApiHeader({ name: 'X-Organization-Id', required: true })
  @ApiOperation({
    operationId: 'scimGetUser',
    summary: 'SCIM 2.0 get user',
  })
  async getUser(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-organization-id') organizationId: string,
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    await this.scimService.assertScimBearer(organizationId, authorization);
    return this.scimService.getUser(organizationId, id);
  }

  @Post('v2/Users')
  @ApiHeader({ name: 'X-Organization-Id', required: true })
  @ApiOperation({
    operationId: 'scimCreateUser',
    summary: 'SCIM 2.0 provision user',
  })
  async createUser(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-organization-id') organizationId: string,
    @Body() dto: ScimUserDto,
    @Req() req: Request,
  ) {
    await this.scimService.assertScimBearer(organizationId, authorization);
    return this.scimService.provisionUser(organizationId, dto, null, req);
  }

  @Put('v2/Users/:id')
  @ApiHeader({ name: 'X-Organization-Id', required: true })
  @ApiOperation({
    operationId: 'scimReplaceUser',
    summary: 'SCIM 2.0 replace/update user',
  })
  async replaceUser(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-organization-id') organizationId: string,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: ScimUserDto,
    @Req() req: Request,
  ) {
    await this.scimService.assertScimBearer(organizationId, authorization);
    dto.externalId = dto.externalId ?? id;
    return this.scimService.provisionUser(organizationId, dto, null, req);
  }

  @Delete('v2/Users/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiHeader({ name: 'X-Organization-Id', required: true })
  @ApiOperation({
    operationId: 'scimDeleteUser',
    summary: 'SCIM 2.0 de-provision user',
  })
  async deleteUser(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-organization-id') organizationId: string,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() req: Request,
  ): Promise<void> {
    await this.scimService.assertScimBearer(organizationId, authorization);
    await this.scimService.deprovisionUser(organizationId, id, null, req);
  }

  @Get('v2/Groups')
  @ApiHeader({ name: 'X-Organization-Id', required: true })
  @ApiOperation({
    operationId: 'scimListGroups',
    summary: 'SCIM 2.0 list groups',
  })
  async listGroups(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-organization-id') organizationId: string,
  ) {
    await this.scimService.assertScimBearer(organizationId, authorization);
    return this.scimService.listGroups(organizationId);
  }

  @Post('v2/Groups')
  @ApiHeader({ name: 'X-Organization-Id', required: true })
  @ApiOperation({
    operationId: 'scimCreateGroup',
    summary: 'SCIM 2.0 provision group',
  })
  async createGroup(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-organization-id') organizationId: string,
    @Body() dto: ScimGroupDto,
    @Req() req: Request,
  ) {
    await this.scimService.assertScimBearer(organizationId, authorization);
    return this.scimService.upsertGroup(organizationId, dto, null, req);
  }

  @Delete('v2/Groups/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiHeader({ name: 'X-Organization-Id', required: true })
  @ApiOperation({
    operationId: 'scimDeleteGroup',
    summary: 'SCIM 2.0 delete group',
  })
  async deleteGroup(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-organization-id') organizationId: string,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() req: Request,
  ): Promise<void> {
    await this.scimService.assertScimBearer(organizationId, authorization);
    await this.scimService.deleteGroup(organizationId, id, null, req);
  }
}
