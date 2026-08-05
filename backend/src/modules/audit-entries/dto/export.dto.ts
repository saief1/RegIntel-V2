import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsObject, IsOptional } from 'class-validator';

export class AuditExportDto {
  @ApiPropertyOptional({ enum: ['JSON', 'CSV'], default: 'JSON' })
  @IsOptional()
  @IsIn(['JSON', 'CSV'])
  format?: 'JSON' | 'CSV';

  @ApiPropertyOptional({ type: 'object', additionalProperties: true })
  @IsOptional()
  @IsObject()
  filters?: Record<string, string>;
}
