import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional } from 'class-validator';
import { CreateWorkflowDto } from './create.dto';

export class UpdateWorkflowDto extends PartialType(CreateWorkflowDto) {
  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  expectedVersion?: number;
}
