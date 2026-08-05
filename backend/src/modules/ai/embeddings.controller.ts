import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiHeader,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Request } from 'express';
import { OrganizationGuard } from '../../common/guards/organization.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  EmbedBatchDto,
  EmbedEntityDto,
  RebuildVectorsDto,
  VectorSearchDto,
} from './dto/embed.dto';
import { EmbeddingsService } from './embeddings/embeddings.service';
import { AI_PROVIDER, AIProvider } from './providers/ai-provider.types';
import { Inject } from '@nestjs/common';
import { VECTOR_STORE, VectorStore } from './vector/vector.types';
import { PgVectorStore } from './vector/pgvector.store';

@ApiTags('ai')
@ApiBearerAuth()
@ApiHeader({ name: 'X-Organization-Id', required: true })
@UseGuards(JwtAuthGuard, OrganizationGuard)
@Controller('ai')
export class EmbeddingsController {
  constructor(
    private readonly embeddings: EmbeddingsService,
    @Inject(AI_PROVIDER) private readonly provider: AIProvider,
    @Inject(VECTOR_STORE) private readonly store: VectorStore,
    private readonly pgVector: PgVectorStore,
  ) {}

  @Post('embeddings')
  @ApiOperation({
    operationId: 'aiEmbedEntity',
    summary: 'Generate/update embeddings for an entity',
  })
  embed(@Req() req: Request, @Body() dto: EmbedEntityDto) {
    return this.embeddings.embedEntity({
      organizationId: req.organizationId!,
      userId: req.user!.userId,
      ...dto,
    });
  }

  @Post('embeddings/batch')
  @ApiOperation({
    operationId: 'aiEmbedBatch',
    summary: 'Batch embed entities',
  })
  embedBatch(@Req() req: Request, @Body() dto: EmbedBatchDto) {
    return this.embeddings.embedBatch(
      dto.items.map((item) => ({
        organizationId: req.organizationId!,
        userId: req.user!.userId,
        ...item,
      })),
    );
  }

  @Post('embeddings/rebuild')
  @ApiOperation({
    operationId: 'aiRebuildEmbeddings',
    summary: 'Rebuild / refresh vector namespace metadata',
  })
  rebuild(@Req() req: Request, @Body() dto: RebuildVectorsDto) {
    return this.embeddings.rebuildNamespace(
      req.organizationId!,
      dto.namespace ?? 'default',
    );
  }

  @Post('vectors/search')
  @ApiOperation({
    operationId: 'aiVectorSearch',
    summary: 'Similarity / hybrid vector search',
  })
  async search(@Req() req: Request, @Body() dto: VectorSearchDto) {
    const embedded = await this.provider.embed({
      texts: [dto.query],
      organizationId: req.organizationId!,
      requestId: req.requestId,
    });
    const hits = await this.store.similaritySearch({
      vector: embedded.embeddings[0] ?? [],
      topK: dto.topK ?? 8,
      filter: {
        organizationId: req.organizationId!,
        namespace: dto.namespace ?? 'default',
        entityTypes: dto.entityTypes,
      },
      queryText: dto.query,
    });
    return {
      hits,
      model: embedded.model,
      provider: embedded.provider,
      store: this.store.name,
    };
  }

  @Post('vectors/reindex')
  @ApiOperation({
    operationId: 'aiVectorReindex',
    summary: 'Touch re-index metadata for a namespace',
  })
  async reindex(@Req() req: Request, @Body() dto: RebuildVectorsDto) {
    const ns = dto.namespace ?? 'default';
    await this.pgVector.touchMetadata(req.organizationId!, ns, 0);
    return { organizationId: req.organizationId!, namespace: ns, status: 'ok' };
  }
}
