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
import { CreateCasesDto } from './dto/create.dto';
import { ListCasesQueryDto } from './dto/list-query.dto';
import { UpdateCasesDto } from './dto/update.dto';
import { CasesService } from './cases.service';

@ApiTags('cases')
@ApiBearerAuth()
@ApiHeader({ name: 'X-Organization-Id', required: true })
@UseGuards(JwtAuthGuard, OrganizationGuard)
@Controller('cases')
export class CasesController {
  constructor(private readonly service: CasesService) {}

  @Get()
  @ApiOperation({ operationId: 'casesList', summary: 'List cases' })
  list(@Req() req: Request, @Query() query: ListCasesQueryDto) {
    return this.service.list(req.organizationId!, query);
  }

  @Get(':id')
  @ApiOperation({ operationId: 'casesGet', summary: 'Get Case' })
  get(@Req() req: Request, @Param('id', ParseUUIDPipe) id: string) {
    return this.service.get(req.organizationId!, id);
  }

  @Post()
  @ApiOperation({ operationId: 'casesCreate', summary: 'Create Case' })
  create(@Req() req: Request, @Body() dto: CreateCasesDto) {
    return this.service.create(req.organizationId!, req.user!.userId, dto);
  }

  @Patch(':id')
  @ApiOperation({ operationId: 'casesUpdate', summary: 'Update Case' })
  update(
    @Req() req: Request,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCasesDto,
  ) {
    return this.service.update(req.organizationId!, req.user!.userId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ operationId: 'casesDelete', summary: 'Soft-delete Case' })
  remove(@Req() req: Request, @Param('id', ParseUUIDPipe) id: string) {
    return this.service.remove(req.organizationId!, req.user!.userId, id);
  }
}
