import { Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiHeader,
  ApiOperation,
  ApiPropertyOptional,
  ApiTags,
} from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { Request } from 'express';
import { OrganizationGuard } from '../../common/guards/organization.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SearchService } from './search.service';

class SearchQueryDto {
  @ApiPropertyOptional()
  @IsString()
  q!: string;

  @ApiPropertyOptional({
    description: 'Comma-separated entity types',
  })
  @IsOptional()
  @IsString()
  types?: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number = 20;
}

@ApiTags('search')
@ApiBearerAuth()
@ApiHeader({ name: 'X-Organization-Id', required: true })
@UseGuards(JwtAuthGuard, OrganizationGuard)
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @ApiOperation({
    operationId: 'searchQuery',
    summary: 'Search indexed documents with highlighting and ranking',
  })
  query(@Req() req: Request, @Query() query: SearchQueryDto) {
    return this.searchService.search({
      organizationId: req.organizationId!,
      q: query.q ?? '',
      entityTypes: query.types
        ? query.types
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean)
        : undefined,
      page: query.page,
      pageSize: query.pageSize,
    });
  }

  @Post('rebuild')
  @ApiOperation({
    operationId: 'searchRebuild',
    summary: 'Enqueue full search index rebuild for the organization',
  })
  rebuild(@Req() req: Request) {
    return this.searchService.enqueueRebuild(req.organizationId!);
  }

  @Post('rebuild/sync')
  @ApiOperation({
    operationId: 'searchRebuildSync',
    summary: 'Rebuild search index synchronously (ops/dev)',
  })
  rebuildSync(@Req() req: Request) {
    return this.searchService.rebuild(req.organizationId!);
  }

  @Get('stats')
  @ApiOperation({
    operationId: 'searchStats',
    summary: 'Search index stats for the organization',
  })
  stats(@Req() req: Request) {
    return this.searchService.stats(req.organizationId!);
  }
}
