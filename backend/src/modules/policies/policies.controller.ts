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
import { CreatePoliciesDto } from './dto/create.dto';
import { ListPoliciesQueryDto } from './dto/list-query.dto';
import { UpdatePoliciesDto } from './dto/update.dto';
import { PoliciesService } from './policies.service';

@ApiTags('policies')
@ApiBearerAuth()
@ApiHeader({ name: 'X-Organization-Id', required: true })
@UseGuards(JwtAuthGuard, OrganizationGuard)
@Controller('policies')
export class PoliciesController {
  constructor(private readonly service: PoliciesService) {}

  @Get()
  @ApiOperation({ operationId: 'policiesList', summary: 'List policies' })
  list(@Req() req: Request, @Query() query: ListPoliciesQueryDto) {
    return this.service.list(req.organizationId!, query);
  }

  @Get(':id')
  @ApiOperation({ operationId: 'policiesGet', summary: 'Get Policy' })
  get(@Req() req: Request, @Param('id', ParseUUIDPipe) id: string) {
    return this.service.get(req.organizationId!, id);
  }

  @Post()
  @ApiOperation({ operationId: 'policiesCreate', summary: 'Create Policy' })
  create(@Req() req: Request, @Body() dto: CreatePoliciesDto) {
    return this.service.create(req.organizationId!, req.user!.userId, dto);
  }

  @Patch(':id')
  @ApiOperation({ operationId: 'policiesUpdate', summary: 'Update Policy' })
  update(
    @Req() req: Request,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePoliciesDto,
  ) {
    return this.service.update(req.organizationId!, req.user!.userId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({
    operationId: 'policiesDelete',
    summary: 'Soft-delete Policy',
  })
  remove(@Req() req: Request, @Param('id', ParseUUIDPipe) id: string) {
    return this.service.remove(req.organizationId!, req.user!.userId, id);
  }
}
