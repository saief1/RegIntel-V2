import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
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
import { CreateNotificationDto } from './dto/create-notification.dto';
import { ListNotificationsQueryDto } from './dto/list-notifications.dto';
import {
  BulkIdsDto,
  UpdatePreferencesDto,
} from './dto/notification-actions.dto';
import { NotificationsService } from './notifications.service';

@ApiTags('notifications')
@ApiBearerAuth()
@ApiHeader({ name: 'X-Organization-Id', required: true })
@UseGuards(JwtAuthGuard, OrganizationGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({
    operationId: 'notificationsList',
    summary: 'List notifications for the current user',
  })
  list(@Req() req: Request, @Query() query: ListNotificationsQueryDto) {
    return this.notificationsService.list(
      req.organizationId!,
      req.user!.userId,
      query,
    );
  }

  @Get('preferences')
  @ApiOperation({
    operationId: 'notificationsGetPreferences',
    summary: 'Get notification preferences',
  })
  getPreferences(@Req() req: Request) {
    return this.notificationsService.getPreferences(
      req.organizationId!,
      req.user!.userId,
    );
  }

  @Patch('preferences')
  @ApiOperation({
    operationId: 'notificationsUpdatePreferences',
    summary: 'Update notification preferences',
  })
  updatePreferences(@Req() req: Request, @Body() dto: UpdatePreferencesDto) {
    return this.notificationsService.updatePreferences(
      req.organizationId!,
      req.user!.userId,
      dto,
    );
  }

  @Get(':id')
  @ApiOperation({
    operationId: 'notificationsGet',
    summary: 'Get a notification',
  })
  get(@Req() req: Request, @Param('id', ParseUUIDPipe) id: string) {
    return this.notificationsService.get(
      req.organizationId!,
      req.user!.userId,
      id,
    );
  }

  @Post()
  @ApiOperation({
    operationId: 'notificationsCreate',
    summary: 'Create a notification (and queue email delivery when enabled)',
  })
  create(@Req() req: Request, @Body() dto: CreateNotificationDto) {
    return this.notificationsService.create(
      req.organizationId!,
      req.user!.userId,
      dto,
    );
  }

  @Post('read')
  @ApiOperation({
    operationId: 'notificationsMarkRead',
    summary: 'Mark notifications read (bulk)',
  })
  markRead(@Req() req: Request, @Body() dto: BulkIdsDto) {
    return this.notificationsService.markRead(
      req.organizationId!,
      req.user!.userId,
      dto.ids,
    );
  }

  @Post('read-all')
  @ApiOperation({
    operationId: 'notificationsMarkAllRead',
    summary: 'Mark all notifications read',
  })
  markAllRead(@Req() req: Request) {
    return this.notificationsService.markAllRead(
      req.organizationId!,
      req.user!.userId,
    );
  }

  @Post('archive')
  @ApiOperation({
    operationId: 'notificationsArchive',
    summary: 'Archive notifications (bulk)',
  })
  archive(@Req() req: Request, @Body() dto: BulkIdsDto) {
    return this.notificationsService.archive(
      req.organizationId!,
      req.user!.userId,
      dto.ids,
    );
  }
}
