import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
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
import { ChatDto, CreateConversationDto } from './dto/chat.dto';
import { AiGatewayService } from './gateway/ai-gateway.service';
import { PromptManager } from './prompts/prompt.manager';

@ApiTags('ai')
@ApiBearerAuth()
@ApiHeader({ name: 'X-Organization-Id', required: true })
@UseGuards(JwtAuthGuard, OrganizationGuard)
@Controller('ai')
export class AiController {
  constructor(
    private readonly gateway: AiGatewayService,
    private readonly prompts: PromptManager,
  ) {}

  @Get('health')
  @ApiOperation({
    operationId: 'aiHealth',
    summary: 'AI gateway + provider health',
  })
  health() {
    return this.gateway.health();
  }

  @Get('metrics')
  @ApiOperation({
    operationId: 'aiMetrics',
    summary: 'In-process AI gateway metrics',
  })
  metrics() {
    return this.gateway.getMetrics();
  }

  @Get('conversations')
  @ApiOperation({
    operationId: 'aiListConversations',
    summary: 'List AI conversations for current user',
  })
  listConversations(@Req() req: Request) {
    return this.gateway.listConversations(
      req.organizationId!,
      req.user!.userId,
    );
  }

  @Post('conversations')
  @ApiOperation({
    operationId: 'aiCreateConversation',
    summary: 'Create an AI conversation',
  })
  createConversation(@Req() req: Request, @Body() dto: CreateConversationDto) {
    return this.gateway.createConversation(
      req.organizationId!,
      req.user!.userId,
      dto.title,
      dto.mode,
    );
  }

  @Get('conversations/:id')
  @ApiOperation({
    operationId: 'aiGetConversation',
    summary: 'Get conversation with messages',
  })
  getConversation(@Req() req: Request, @Param('id', ParseUUIDPipe) id: string) {
    return this.gateway.getConversation(
      req.organizationId!,
      req.user!.userId,
      id,
    );
  }

  @Delete('conversations/:id')
  @ApiOperation({
    operationId: 'aiDeleteConversation',
    summary: 'Soft-delete a conversation',
  })
  deleteConversation(
    @Req() req: Request,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.gateway.deleteConversation(
      req.organizationId!,
      req.user!.userId,
      id,
    );
  }

  @Post('chat')
  @ApiOperation({
    operationId: 'aiChat',
    summary: 'Send a chat message through the AI gateway',
  })
  chat(@Req() req: Request, @Body() dto: ChatDto) {
    return this.gateway.chat({
      organizationId: req.organizationId!,
      userId: req.user!.userId,
      conversationId: dto.conversationId,
      message: dto.message,
      mode: dto.mode,
      title: dto.title,
      context: dto.context,
      requestId: req.requestId,
    });
  }

  @Get('prompts')
  @ApiOperation({
    operationId: 'aiListPrompts',
    summary: 'List prompt templates (builtin + org)',
  })
  listPrompts(@Req() req: Request) {
    return this.prompts.listPrompts(req.organizationId);
  }
}
