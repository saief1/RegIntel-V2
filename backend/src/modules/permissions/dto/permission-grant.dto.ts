import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AppRole, PermissionEffect, PermissionScope } from '@prisma/client';
import {
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  ValidateIf,
} from 'class-validator';

export class CreatePermissionGrantDto {
  @ApiProperty({ example: 'cases:write' })
  @IsString()
  permissionKey!: string;

  @ApiProperty({ enum: PermissionScope })
  @IsEnum(PermissionScope)
  scope!: PermissionScope;

  @ApiPropertyOptional({
    description: 'Team id (TEAM) or resource id (RESOURCE)',
  })
  @ValidateIf((o: CreatePermissionGrantDto) => o.scope !== 'ORGANIZATION')
  @IsUUID()
  scopeId?: string;

  @ApiPropertyOptional({ example: 'case' })
  @ValidateIf((o: CreatePermissionGrantDto) => o.scope === 'RESOURCE')
  @IsString()
  resourceType?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  userId?: string;

  @ApiPropertyOptional({ enum: AppRole })
  @IsOptional()
  @IsEnum(AppRole)
  roleKey?: AppRole;

  @ApiPropertyOptional({ enum: PermissionEffect, default: 'ALLOW' })
  @IsOptional()
  @IsEnum(PermissionEffect)
  effect?: PermissionEffect;
}

export class CheckPermissionDto {
  @ApiProperty({ example: 'cases:read' })
  @IsString()
  permission!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  resourceType?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  resourceId?: string;
}
