import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EmbeddingEntityType, IndexingJobKind } from '@prisma/client';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class IndexDocumentDto {
  @ApiProperty({ enum: EmbeddingEntityType })
  @IsEnum(EmbeddingEntityType)
  entityType!: EmbeddingEntityType;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  entityId!: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  title!: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  @MaxLength(200000)
  content!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(64)
  namespace?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(64)
  workspaceId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(64)
  sourceVersion?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  force?: boolean;
}

export class IndexJobDto {
  @ApiProperty({ enum: IndexingJobKind })
  @IsEnum(IndexingJobKind)
  kind!: IndexingJobKind;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(EmbeddingEntityType)
  entityType?: EmbeddingEntityType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  entityId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  namespace?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  workspaceId?: string;

  @ApiPropertyOptional({
    description: 'Full org re-index of domain entities',
  })
  @IsOptional()
  @IsBoolean()
  full?: boolean;
}

export class RetrieveDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  @MaxLength(8000)
  query!: string;

  @ApiPropertyOptional({ default: 8 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(50)
  topK?: number;

  @ApiPropertyOptional({ default: 0.15 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  similarityThreshold?: number;

  @ApiPropertyOptional({ type: [String], enum: EmbeddingEntityType })
  @IsOptional()
  @IsArray()
  @IsEnum(EmbeddingEntityType, { each: true })
  entityTypes?: EmbeddingEntityType[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  docTypes?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  namespace?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  workspaceId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  sessionId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  includeRelated?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  recommendPolicies?: boolean;
}

export class RagAskDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  @MaxLength(16000)
  question!: string;

  @ApiPropertyOptional({
    example: 'chat',
    description:
      'Workspace mode: chat, research, document_analysis, compare, drafting, executive_brief, board_report, work, knowledge, case, policy, report',
  })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  mode?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  conversationId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  sessionId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  workspaceId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(50)
  topK?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  similarityThreshold?: number;

  @ApiPropertyOptional({ type: [String], enum: EmbeddingEntityType })
  @IsOptional()
  @IsArray()
  @IsEnum(EmbeddingEntityType, { each: true })
  entityTypes?: EmbeddingEntityType[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  docTypes?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  context?: Record<string, string>;
}

export class CreateSearchSessionDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(64)
  mode?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  workspaceId?: string;
}

export class KnowledgeRelationDto {
  @ApiProperty({ enum: EmbeddingEntityType })
  @IsEnum(EmbeddingEntityType)
  fromEntityType!: EmbeddingEntityType;

  @ApiProperty()
  @IsString()
  fromEntityId!: string;

  @ApiProperty({ enum: EmbeddingEntityType })
  @IsEnum(EmbeddingEntityType)
  toEntityType!: EmbeddingEntityType;

  @ApiProperty()
  @IsString()
  toEntityId!: string;

  @ApiProperty({
    enum: [
      'RELATED',
      'IMPLEMENTS',
      'REFERENCES',
      'SUPERSEDES',
      'SUPPORTS',
      'DERIVED_FROM',
    ],
  })
  @IsString()
  relationType!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  weight?: number;
}
