import {
  Body,
  Controller,
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
import { KnowledgeRelationType } from '@prisma/client';
import { Request } from 'express';
import { PrismaService } from '../../common/prisma/prisma.service';
import { OrganizationGuard } from '../../common/guards/organization.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CitationsService } from './citations/citations.service';
import {
  CreateSearchSessionDto,
  IndexDocumentDto,
  IndexJobDto,
  KnowledgeRelationDto,
  RagAskDto,
  RetrieveDto,
} from './dto/rag.dto';
import { IndexingService } from './indexing/indexing.service';
import { RagService } from './rag/rag.service';
import { RetrievalService } from './retrieval/retrieval.service';

@ApiTags('ai-rag')
@ApiBearerAuth()
@ApiHeader({ name: 'X-Organization-Id', required: true })
@UseGuards(JwtAuthGuard, OrganizationGuard)
@Controller('ai')
export class RagController {
  constructor(
    private readonly indexing: IndexingService,
    private readonly retrieval: RetrievalService,
    private readonly rag: RagService,
    private readonly citations: CitationsService,
    private readonly prisma: PrismaService,
  ) {}

  @Post('index')
  @ApiOperation({
    operationId: 'aiIndexDocument',
    summary: 'Index a single knowledge document (C006)',
  })
  indexDocument(@Req() req: Request, @Body() dto: IndexDocumentDto) {
    return this.indexing.indexDocument({
      organizationId: req.organizationId!,
      userId: req.user!.userId,
      ...dto,
    });
  }

  @Post('index/jobs')
  @ApiOperation({
    operationId: 'aiIndexJob',
    summary: 'Start index / reindex / delete job (C006)',
  })
  runIndexJob(@Req() req: Request, @Body() dto: IndexJobDto) {
    return this.indexing.runJob({
      organizationId: req.organizationId!,
      ...dto,
    });
  }

  @Get('index/jobs')
  @ApiOperation({
    operationId: 'aiListIndexJobs',
    summary: 'List recent indexing jobs',
  })
  listIndexJobs(@Req() req: Request) {
    return this.indexing.listJobs(req.organizationId!);
  }

  @Get('index/jobs/:id')
  @ApiOperation({
    operationId: 'aiGetIndexJob',
    summary: 'Get indexing job status',
  })
  getIndexJob(@Req() req: Request, @Param('id', ParseUUIDPipe) id: string) {
    return this.indexing.getJob(req.organizationId!, id);
  }

  @Post('retrieve')
  @ApiOperation({
    operationId: 'aiRetrieve',
    summary: 'Hybrid / semantic retrieval (C007)',
  })
  retrieve(@Req() req: Request, @Body() dto: RetrieveDto) {
    return this.retrieval.retrieve({
      organizationId: req.organizationId!,
      userId: req.user!.userId,
      query: dto.query,
      topK: dto.topK,
      similarityThreshold: dto.similarityThreshold,
      sessionId: dto.sessionId,
      includeRelated: dto.includeRelated ?? true,
      recommendPolicies: dto.recommendPolicies ?? true,
      filters: {
        namespace: dto.namespace,
        workspaceId: dto.workspaceId,
        entityTypes: dto.entityTypes,
        docTypes: dto.docTypes,
      },
    });
  }

  @Post('rag/ask')
  @ApiOperation({
    operationId: 'aiRagAsk',
    summary: 'RAG grounded answer (C008)',
  })
  ask(@Req() req: Request, @Body() dto: RagAskDto) {
    return this.rag.ask({
      organizationId: req.organizationId!,
      userId: req.user!.userId,
      question: dto.question,
      mode: dto.mode,
      conversationId: dto.conversationId,
      sessionId: dto.sessionId,
      workspaceId: dto.workspaceId,
      topK: dto.topK,
      similarityThreshold: dto.similarityThreshold,
      entityTypes: dto.entityTypes,
      docTypes: dto.docTypes,
      context: dto.context,
      requestId: req.requestId,
    });
  }

  @Get('rag/queries/:id')
  @ApiOperation({
    operationId: 'aiGetRagQuery',
    summary: 'Get persisted RAG query with results',
  })
  getRagQuery(@Req() req: Request, @Param('id', ParseUUIDPipe) id: string) {
    return this.prisma.ragQuery.findFirst({
      where: { id, organizationId: req.organizationId! },
      include: {
        results: { orderBy: { rank: 'asc' } },
        citations: { orderBy: { marker: 'asc' } },
      },
    });
  }

  @Get('citations/query/:queryId')
  @ApiOperation({
    operationId: 'aiListCitations',
    summary: 'List citations for a RAG query (C009)',
  })
  listCitations(
    @Req() req: Request,
    @Param('queryId', ParseUUIDPipe) queryId: string,
  ) {
    return this.citations.listForQuery(req.organizationId!, queryId);
  }

  @Get('citations/:id/source')
  @ApiOperation({
    operationId: 'aiCitationSource',
    summary: 'Source card / preview for a citation',
  })
  citationSource(@Req() req: Request, @Param('id', ParseUUIDPipe) id: string) {
    return this.citations.getSourceCard(req.organizationId!, id);
  }

  @Get('citations/export/:queryId')
  @ApiOperation({
    operationId: 'aiExportCitations',
    summary: 'Export citations package for a RAG query',
  })
  exportCitations(
    @Req() req: Request,
    @Param('queryId', ParseUUIDPipe) queryId: string,
  ) {
    return this.citations.exportCitations(req.organizationId!, queryId);
  }

  @Post('search-sessions')
  @ApiOperation({
    operationId: 'aiCreateSearchSession',
    summary: 'Create a retrieval/search session',
  })
  createSession(@Req() req: Request, @Body() dto: CreateSearchSessionDto) {
    return this.prisma.searchSession.create({
      data: {
        organizationId: req.organizationId!,
        userId: req.user!.userId,
        title: dto.title ?? 'Search session',
        mode: dto.mode ?? 'research',
        workspaceId: dto.workspaceId,
      },
    });
  }

  @Post('knowledge-relationships')
  @ApiOperation({
    operationId: 'aiUpsertKnowledgeRelationship',
    summary: 'Upsert knowledge relationship metadata',
  })
  upsertRelation(@Req() req: Request, @Body() dto: KnowledgeRelationDto) {
    return this.prisma.knowledgeRelationship.upsert({
      where: {
        organizationId_fromEntityType_fromEntityId_toEntityType_toEntityId_relationType:
          {
            organizationId: req.organizationId!,
            fromEntityType: dto.fromEntityType,
            fromEntityId: dto.fromEntityId,
            toEntityType: dto.toEntityType,
            toEntityId: dto.toEntityId,
            relationType: dto.relationType as KnowledgeRelationType,
          },
      },
      create: {
        organizationId: req.organizationId!,
        fromEntityType: dto.fromEntityType,
        fromEntityId: dto.fromEntityId,
        toEntityType: dto.toEntityType,
        toEntityId: dto.toEntityId,
        relationType: dto.relationType as KnowledgeRelationType,
        weight: dto.weight ?? 1,
      },
      update: { weight: dto.weight ?? 1 },
    });
  }

  @Get('retrieval/metrics')
  @ApiOperation({
    operationId: 'aiRetrievalMetrics',
    summary: 'Daily retrieval metrics for the tenant',
  })
  retrievalMetrics(@Req() req: Request) {
    return this.prisma.retrievalMetric.findMany({
      where: { organizationId: req.organizationId! },
      orderBy: { periodStart: 'desc' },
      take: 30,
    });
  }
}
