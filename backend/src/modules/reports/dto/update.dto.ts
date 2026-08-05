import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { CreateReportsDto } from './create.dto';

export class UpdateReportsDto extends PartialType(CreateReportsDto) {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  resultUrl?: string;
}
