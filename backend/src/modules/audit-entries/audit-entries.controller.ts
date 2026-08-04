import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
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
    summary: 'List application audit entries for the organization',
  })
  list(@Req() req: Request, @Query() query: PaginationQueryDto) {
    return this.auditEntriesService.list(req.organizationId!, query);
  }
}
