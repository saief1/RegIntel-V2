import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
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
import { SsoMockCallbackDto, UpsertSsoConfigurationDto } from './dto/sso.dto';
import { SsoService } from './sso.service';

@ApiTags('sso')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, OrganizationGuard)
@ApiHeader({ name: 'X-Organization-Id', required: true })
@Controller('sso')
export class SsoController {
  constructor(private readonly ssoService: SsoService) {}

  @Get('configurations')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('security:read')
  @ApiOperation({
    operationId: 'ssoListConfigurations',
    summary: 'List SSO configurations for the active organization',
  })
  list(@Req() req: Request) {
    return this.ssoService.listConfigurations(req.organizationId!);
  }

  @Post('configurations/mock-defaults')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('sso:manage')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    operationId: 'ssoEnsureMockDefaults',
    summary: 'Ensure mock OIDC/SAML provider configurations exist',
  })
  mockDefaults(@Req() req: Request) {
    return this.ssoService.ensureMockDefaults(req.organizationId!);
  }

  @Put('configurations')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('sso:manage')
  @ApiOperation({
    operationId: 'ssoUpsertConfiguration',
    summary: 'Create or update an SSO provider configuration',
  })
  upsert(@Req() req: Request, @Body() dto: UpsertSsoConfigurationDto) {
    return this.ssoService.upsertConfiguration(
      req.organizationId!,
      req.user!.userId,
      dto,
      req,
    );
  }

  @Post('configurations/:id/enable')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('sso:manage')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    operationId: 'ssoEnableConfiguration',
    summary: 'Enable an SSO configuration',
  })
  enable(@Req() req: Request, @Param('id', new ParseUUIDPipe()) id: string) {
    return this.ssoService.setEnabled(
      req.organizationId!,
      id,
      true,
      req.user!.userId,
      req,
    );
  }

  @Post('configurations/:id/disable')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('sso:manage')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    operationId: 'ssoDisableConfiguration',
    summary: 'Disable an SSO configuration',
  })
  disable(@Req() req: Request, @Param('id', new ParseUUIDPipe()) id: string) {
    return this.ssoService.setEnabled(
      req.organizationId!,
      id,
      false,
      req.user!.userId,
      req,
    );
  }

  @Get('configurations/:id/authorize')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('security:read')
  @ApiOperation({
    operationId: 'ssoAuthorize',
    summary: 'Build IdP authorize/login redirect URL (mock-capable)',
  })
  authorize(
    @Req() req: Request,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Query('redirectUri')
    redirectUri = 'https://app.regintel.local/sso/callback',
  ) {
    return this.ssoService.getAuthorizeUrl(
      req.organizationId!,
      id,
      redirectUri,
    );
  }

  @Post('configurations/:id/callback')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('security:read')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    operationId: 'ssoMockCallback',
    summary: 'Mock OIDC/SAML callback exchange (interfaces only)',
  })
  callback(
    @Req() req: Request,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: SsoMockCallbackDto,
  ) {
    return this.ssoService.mockCallback(
      req.organizationId!,
      id,
      dto.codeOrAssertion,
    );
  }
}
