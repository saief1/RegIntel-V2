import {
  Body,
  Controller,
  Get,
  Param,
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
import { IsObject, IsOptional, IsString, IsEmail } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Request } from 'express';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { OrganizationGuard } from '../../common/guards/organization.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { EmailService } from './email.service';

class SendEmailDto {
  @ApiProperty()
  @IsEmail()
  to!: string;

  @ApiProperty()
  @IsString()
  templateKey!: string;

  @ApiPropertyOptional({ type: 'object', additionalProperties: true })
  @IsOptional()
  @IsObject()
  variables?: Record<string, string>;
}

@ApiTags('email')
@Controller('email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Get('templates')
  @ApiBearerAuth()
  @ApiHeader({ name: 'X-Organization-Id', required: true })
  @UseGuards(JwtAuthGuard, OrganizationGuard)
  @ApiOperation({
    operationId: 'emailListTemplates',
    summary: 'List email templates (system + org overrides)',
  })
  listTemplates(@Req() req: Request) {
    return this.emailService.listTemplates(req.organizationId);
  }

  @Get('deliveries')
  @ApiBearerAuth()
  @ApiHeader({ name: 'X-Organization-Id', required: true })
  @UseGuards(JwtAuthGuard, OrganizationGuard)
  @ApiOperation({
    operationId: 'emailListDeliveries',
    summary: 'List email delivery log for the organization',
  })
  listDeliveries(@Req() req: Request, @Query() query: PaginationQueryDto) {
    return this.emailService.listDeliveries(
      req.organizationId!,
      query.page,
      query.pageSize,
    );
  }

  @Post('send')
  @ApiBearerAuth()
  @ApiHeader({ name: 'X-Organization-Id', required: true })
  @UseGuards(JwtAuthGuard, OrganizationGuard)
  @ApiOperation({
    operationId: 'emailSendTemplated',
    summary: 'Queue a templated email (uses USE_REAL_EMAIL for provider)',
  })
  send(@Req() req: Request, @Body() body: SendEmailDto) {
    return this.emailService.sendTemplated({
      to: body.to,
      templateKey: body.templateKey,
      variables: body.variables,
      organizationId: req.organizationId,
      userId: req.user?.userId,
      enqueue: true,
    });
  }

  @Post('webhooks/:provider')
  @ApiOperation({
    operationId: 'emailWebhook',
    summary: 'Provider delivery webhook placeholder',
  })
  webhook(@Param('provider') provider: string, @Body() body: unknown) {
    return this.emailService.handleWebhook(provider, body);
  }

  @Get('health')
  @ApiOperation({
    operationId: 'emailHealth',
    summary: 'Email provider readiness',
  })
  health() {
    return this.emailService.healthCheck();
  }
}
