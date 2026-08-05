import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional } from 'class-validator';
import { CreateTasksDto } from './create.dto';

export class UpdateTasksDto extends PartialType(CreateTasksDto) {
  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  expectedVersion?: number;
}
