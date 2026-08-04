import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SessionsService } from './sessions.service';

@ApiTags('sessions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('sessions')
export class SessionsController {
  constructor(
    private readonly sessionsService: SessionsService,
    private readonly configService: ConfigService,
  ) {}

  @Get()
  @ApiOperation({
    operationId: 'sessionsList',
    summary: 'List active sessions for the current user',
  })
  list(@Req() req: Request) {
    return this.sessionsService.listSessions(req.user!.userId, req);
  }

  @Get('policy')
  @ApiOperation({
    operationId: 'sessionsPolicy',
    summary: 'Session idle timeout and policy hints',
  })
  policy() {
    return {
      idleTimeoutSeconds: this.sessionsService.getIdleTimeoutSeconds(),
    };
  }

  @Delete(':sessionId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    operationId: 'sessionsRevoke',
    summary: 'Revoke a session (refresh token family)',
  })
  async revoke(
    @Req() req: Request,
    @Param('sessionId', ParseUUIDPipe) sessionId: string,
  ): Promise<void> {
    await this.sessionsService.revokeSession(req.user!.userId, sessionId, req);
  }

  @Post('logout-everywhere')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    operationId: 'sessionsLogoutEverywhere',
    summary: 'Revoke all refresh sessions for the current user',
  })
  async logoutEverywhere(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.sessionsService.logoutEverywhere(
      req.user!.userId,
      req,
    );
    const cookieName =
      this.configService.getOrThrow<string>('refreshCookieName');
    const secure = this.configService.getOrThrow<boolean>('cookieSecure');
    res.clearCookie(cookieName, {
      httpOnly: true,
      secure,
      sameSite: 'lax',
      path: '/api/v1/auth',
    });
    return result;
  }
}
