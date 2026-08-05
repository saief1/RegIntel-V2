import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ChangePasswordDto } from './dto/security.dto';
import { SecurityService } from './security.service';

@ApiTags('security')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('security')
export class SecurityController {
  constructor(private readonly securityService: SecurityService) {}

  @Get('devices')
  @ApiOperation({
    operationId: 'securityListDevices',
    summary: 'List MFA trusted devices for the current user',
  })
  listDevices(@Req() req: Request) {
    return this.securityService.listTrustedDevices(req.user!.userId);
  }

  @Delete('devices/:deviceId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    operationId: 'securityRevokeDevice',
    summary: 'Revoke a trusted device',
  })
  async revokeDevice(
    @Req() req: Request,
    @Param('deviceId', ParseUUIDPipe) deviceId: string,
  ): Promise<void> {
    await this.securityService.revokeTrustedDevice(
      req.user!.userId,
      deviceId,
      req,
    );
  }

  @Get('login-history')
  @ApiQuery({ name: 'limit', required: false })
  @ApiOperation({
    operationId: 'securityLoginHistory',
    summary: 'Login history for the current user',
  })
  loginHistory(@Req() req: Request, @Query('limit') limit?: string) {
    return this.securityService.listLoginHistory(
      req.user!.userId,
      limit ? Number(limit) : 50,
    );
  }

  @Get('failed-logins')
  @ApiOperation({
    operationId: 'securityFailedLogins',
    summary: 'Failed login attempts for the current user',
  })
  failedLogins(@Req() req: Request, @Query('limit') limit?: string) {
    return this.securityService.listFailedLogins(
      req.user!.userId,
      limit ? Number(limit) : 50,
    );
  }

  @Get('events')
  @ApiOperation({
    operationId: 'securityEvents',
    summary: 'Security events for the current user',
  })
  events(@Req() req: Request, @Query('limit') limit?: string) {
    return this.securityService.listSecurityEvents(
      req.user!.userId,
      limit ? Number(limit) : 50,
    );
  }

  @Get('audit-trail')
  @ApiOperation({
    operationId: 'securityAuditTrail',
    summary:
      'Queryable security audit trail (persisted events; B024 full store later)',
  })
  auditTrail(@Req() req: Request, @Query('limit') limit?: string) {
    return this.securityService.listAuditTrail(
      req.user!.userId,
      req.organizationId,
      limit ? Number(limit) : 50,
    );
  }

  @Get('password-history')
  @ApiOperation({
    operationId: 'securityPasswordHistory',
    summary: 'Password change history metadata (hashes never returned)',
  })
  passwordHistory(@Req() req: Request) {
    return this.securityService.listPasswordHistoryMeta(req.user!.userId);
  }

  @Get('hardening')
  @ApiOperation({
    operationId: 'securityHardeningAudit',
    summary: 'Security hardening control checklist (B023)',
  })
  hardeningAudit() {
    return this.securityService.securityHardeningAudit();
  }

  @Post('password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    operationId: 'securityChangePassword',
    summary: 'Change password with history reuse checks; revokes all sessions',
  })
  changePassword(@Req() req: Request, @Body() dto: ChangePasswordDto) {
    return this.securityService.changePassword(req.user!.userId, dto, req);
  }
}
