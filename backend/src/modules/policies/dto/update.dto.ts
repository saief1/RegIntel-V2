import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional } from 'class-validator';
import { CreatePoliciesDto } from './create.dto';

export class UpdatePoliciesDto extends PartialType(CreatePoliciesDto) {
  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  expectedVersion?: number;
}
