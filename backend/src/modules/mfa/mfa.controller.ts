import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  MfaConfirmEnrollDto,
  MfaDisableDto,
  MfaRegenerateRecoveryDto,
  MfaVerifyLoginDto,
} from './dto/mfa.dto';
import { MfaService } from './mfa.service';

@ApiTags('mfa')
@Controller()
export class MfaController {
  constructor(private readonly mfaService: MfaService) {}

  @Get('mfa/status')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    operationId: 'mfaStatus',
    summary: 'Get MFA enrollment status for the current user',
  })
  status(@Req() req: Request) {
    return this.mfaService.getStatus(req.user!.userId);
  }

  @Post('mfa/enroll/start')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    operationId: 'mfaEnrollStart',
    summary: 'Start TOTP enrollment (returns secret + otpauth URL)',
  })
  start(@Req() req: Request) {
    return this.mfaService.startEnrollment(req.user!.userId);
  }

  @Post('mfa/enroll/confirm')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    operationId: 'mfaEnrollConfirm',
    summary: 'Confirm TOTP enrollment and issue recovery codes',
  })
  confirm(@Req() req: Request, @Body() dto: MfaConfirmEnrollDto) {
    return this.mfaService.confirmEnrollment(req.user!.userId, dto.code, req);
  }

  @Post('mfa/disable')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    operationId: 'mfaDisable',
    summary: 'Disable MFA (requires TOTP or recovery code)',
  })
  disable(@Req() req: Request, @Body() dto: MfaDisableDto) {
    return this.mfaService.disable(req.user!.userId, dto, req);
  }

  @Post('mfa/recovery-codes/regenerate')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    operationId: 'mfaRegenerateRecoveryCodes',
    summary: 'Regenerate MFA recovery codes',
  })
  regenerate(@Req() req: Request, @Body() dto: MfaRegenerateRecoveryDto) {
    return this.mfaService.regenerateRecoveryCodes(
      req.user!.userId,
      dto.code,
      req,
    );
  }

  @Post('auth/mfa/verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    operationId: 'authMfaVerify',
    summary: 'Complete login after MFA challenge',
  })
  verifyLogin(
    @Body() dto: MfaVerifyLoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.mfaService.verifyLoginChallenge(dto, req, res);
  }
}
