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
import { CreateTasksDto } from './dto/create.dto';
import { ListTasksQueryDto } from './dto/list-query.dto';
import { UpdateTasksDto } from './dto/update.dto';
import { TasksService } from './tasks.service';

@ApiTags('tasks')
@ApiBearerAuth()
@ApiHeader({ name: 'X-Organization-Id', required: true })
@UseGuards(JwtAuthGuard, OrganizationGuard)
@Controller('tasks')
export class TasksController {
  constructor(private readonly service: TasksService) {}

  @Get()
  @ApiOperation({ operationId: 'tasksList', summary: 'List tasks' })
  list(@Req() req: Request, @Query() query: ListTasksQueryDto) {
    return this.service.list(req.organizationId!, query);
  }

  @Get(':id')
  @ApiOperation({ operationId: 'tasksGet', summary: 'Get Task' })
  get(@Req() req: Request, @Param('id', ParseUUIDPipe) id: string) {
    return this.service.get(req.organizationId!, id);
  }

  @Post()
  @ApiOperation({ operationId: 'tasksCreate', summary: 'Create Task' })
  create(@Req() req: Request, @Body() dto: CreateTasksDto) {
    return this.service.create(req.organizationId!, req.user!.userId, dto);
  }

  @Patch(':id')
  @ApiOperation({ operationId: 'tasksUpdate', summary: 'Update Task' })
  update(
    @Req() req: Request,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTasksDto,
  ) {
    return this.service.update(req.organizationId!, req.user!.userId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ operationId: 'tasksDelete', summary: 'Soft-delete Task' })
  remove(@Req() req: Request, @Param('id', ParseUUIDPipe) id: string) {
    return this.service.remove(req.organizationId!, req.user!.userId, id);
  }
}
