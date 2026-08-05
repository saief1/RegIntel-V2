import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';

export class CreateReportsDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  title!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty()
  @IsString()
  reportType!: string;

  @ApiPropertyOptional()
  @IsOptional()
  parameters?: Record<string, unknown>;
}
