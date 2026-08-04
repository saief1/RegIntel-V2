import {
  Body,
  Controller,
  Delete,
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
import { CreateKnowledgeDto } from './dto/create.dto';
import { ListKnowledgeQueryDto } from './dto/list-query.dto';
import { UpdateKnowledgeDto } from './dto/update.dto';
import { KnowledgeService } from './knowledge.service';

@ApiTags('knowledge')
@ApiBearerAuth()
@ApiHeader({ name: 'X-Organization-Id', required: true })
@UseGuards(JwtAuthGuard, OrganizationGuard)
@Controller('knowledge')
export class KnowledgeController {
  constructor(private readonly service: KnowledgeService) {}

  @Get()
  @ApiOperation({ operationId: 'knowledgeList', summary: 'List knowledge' })
  list(@Req() req: Request, @Query() query: ListKnowledgeQueryDto) {
    return this.service.list(req.organizationId!, query);
  }

  @Get(':id')
  @ApiOperation({ operationId: 'knowledgeGet', summary: 'Get Document' })
  get(@Req() req: Request, @Param('id', ParseUUIDPipe) id: string) {
    return this.service.get(req.organizationId!, id);
  }

  @Post()
  @ApiOperation({ operationId: 'knowledgeCreate', summary: 'Create Document' })
  create(@Req() req: Request, @Body() dto: CreateKnowledgeDto) {
    return this.service.create(req.organizationId!, req.user!.userId, dto);
  }

  @Patch(':id')
  @ApiOperation({ operationId: 'knowledgeUpdate', summary: 'Update Document' })
  update(
    @Req() req: Request,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateKnowledgeDto,
  ) {
    return this.service.update(req.organizationId!, req.user!.userId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ operationId: 'knowledgeDelete', summary: 'Soft-delete Document' })
  remove(@Req() req: Request, @Param('id', ParseUUIDPipe) id: string) {
    return this.service.remove(req.organizationId!, req.user!.userId, id);
  }
}
