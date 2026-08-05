import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional } from 'class-validator';
import { CreateKnowledgeDto } from './create.dto';

export class UpdateKnowledgeDto extends PartialType(CreateKnowledgeDto) {
  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  expectedVersion?: number;
}
