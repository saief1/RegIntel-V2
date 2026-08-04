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
import { CreateReportsDto } from './dto/create.dto';
import { ListReportsQueryDto } from './dto/list-query.dto';
import { UpdateReportsDto } from './dto/update.dto';
import { ReportsService } from './reports.service';

@ApiTags('reports')
@ApiBearerAuth()
@ApiHeader({ name: 'X-Organization-Id', required: true })
@UseGuards(JwtAuthGuard, OrganizationGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly service: ReportsService) {}

  @Get()
  @ApiOperation({ operationId: 'reportsList', summary: 'List reports' })
  list(@Req() req: Request, @Query() query: ListReportsQueryDto) {
    return this.service.list(req.organizationId!, query);
  }

  @Get(':id')
  @ApiOperation({ operationId: 'reportsGet', summary: 'Get Report' })
  get(@Req() req: Request, @Param('id', ParseUUIDPipe) id: string) {
    return this.service.get(req.organizationId!, id);
  }

  @Post()
  @ApiOperation({ operationId: 'reportsCreate', summary: 'Create Report' })
  create(@Req() req: Request, @Body() dto: CreateReportsDto) {
    return this.service.create(req.organizationId!, req.user!.userId, dto);
  }

  @Patch(':id')
  @ApiOperation({ operationId: 'reportsUpdate', summary: 'Update Report' })
  update(
    @Req() req: Request,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateReportsDto,
  ) {
    return this.service.update(req.organizationId!, req.user!.userId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ operationId: 'reportsDelete', summary: 'Soft-delete Report' })
  remove(@Req() req: Request, @Param('id', ParseUUIDPipe) id: string) {
    return this.service.remove(req.organizationId!, req.user!.userId, id);
  }
}
