import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EmbeddingEntityType } from '@prisma/client';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class EmbedEntityDto {
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
  @MaxLength(200000)
  content!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  title?: string;

  @ApiPropertyOptional({ default: 'default' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  namespace?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  force?: boolean;
}

export class EmbedBatchDto {
  @ApiProperty({ type: [EmbedEntityDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EmbedEntityDto)
  items!: EmbedEntityDto[];
}

export class VectorSearchDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  @MaxLength(8000)
  query!: string;

  @ApiPropertyOptional({ default: 8 })
  @IsOptional()
  topK?: number;

  @ApiPropertyOptional({ default: 'default' })
  @IsOptional()
  @IsString()
  namespace?: string;

  @ApiPropertyOptional({ enum: EmbeddingEntityType, isArray: true })
  @IsOptional()
  @IsArray()
  @IsEnum(EmbeddingEntityType, { each: true })
  entityTypes?: EmbeddingEntityType[];
}

export class RebuildVectorsDto {
  @ApiPropertyOptional({ default: 'default' })
  @IsOptional()
  @IsString()
  namespace?: string;
}
