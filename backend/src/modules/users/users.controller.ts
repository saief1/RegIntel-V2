import { Body, Controller, Get, Patch, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateMeDto } from './dto/update-me.dto';
import { UsersService } from './users.service';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({
    operationId: 'usersGetMe',
    summary: 'Get the authenticated user profile and organizations',
  })
  getMe(@Req() req: Request) {
    return this.usersService.getMe(req.user!.userId);
  }

  @Patch('me')
  @ApiOperation({
    operationId: 'usersUpdateMe',
    summary: 'Update the authenticated user profile',
  })
  updateMe(@Req() req: Request, @Body() dto: UpdateMeDto) {
    return this.usersService.updateMe(req.user!.userId, dto);
  }
}
