import {
  Body,
  Controller,
  Get,
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
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { OrganizationGuard } from '../../common/guards/organization.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuditEntriesService } from './audit-entries.service';
import { AuditExportDto } from './dto/export.dto';
import { AuditListQueryDto } from './dto/list-query.dto';

@ApiTags('audit-entries')
@ApiBearerAuth()
@ApiHeader({ name: 'X-Organization-Id', required: true })
@UseGuards(JwtAuthGuard, OrganizationGuard)
@Controller('audit-entries')
export class AuditEntriesController {
  constructor(private readonly auditEntriesService: AuditEntriesService) {}

  @Get()
  @ApiOperation({
    operationId: 'auditEntriesList',
    summary: 'List audit entries (immutable audit_logs when USE_REAL_AUDIT)',
  })
  list(@Req() req: Request, @Query() query: AuditListQueryDto) {
    return this.auditEntriesService.list(req.organizationId!, query);
  }

  @Get('logs')
  @ApiOperation({
    operationId: 'auditLogsList',
    summary: 'List immutable audit_logs with filters/search',
  })
  listLogs(@Req() req: Request, @Query() query: AuditListQueryDto) {
    return this.auditEntriesService.listLogs(req.organizationId!, query);
  }

  @Post('export')
  @ApiOperation({
    operationId: 'auditExport',
    summary: 'Export filtered audit logs (JSON/CSV)',
  })
  export(@Req() req: Request, @Body() body: AuditExportDto) {
    return this.auditEntriesService.export(
      req.organizationId!,
      req.user?.userId,
      body,
    );
  }

  @Get('exports')
  @ApiOperation({
    operationId: 'auditExportsList',
    summary: 'List prior audit export jobs',
  })
  listExports(@Req() req: Request, @Query() query: PaginationQueryDto) {
    return this.auditEntriesService.listExports(
      req.organizationId!,
      query.page,
      query.pageSize,
    );
  }

  @Get('retention')
  @ApiOperation({
    operationId: 'auditRetentionPolicy',
    summary: 'Current audit retention policy',
  })
  retention() {
    return this.auditEntriesService.retentionPolicy();
  }
}
