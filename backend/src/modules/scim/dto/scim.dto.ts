import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AppRole } from '@prisma/client';
import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ScimNameDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  formatted?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  givenName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  familyName?: string;
}

export class ScimEmailDto {
  @ApiProperty()
  @IsEmail()
  value!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  primary?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  type?: string;
}

export class ScimUserDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  externalId?: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  userName!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @ValidateNested()
  @Type(() => ScimNameDto)
  name?: ScimNameDto;

  @ApiPropertyOptional({ type: [ScimEmailDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ScimEmailDto)
  emails?: ScimEmailDto[];

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @ApiPropertyOptional({
    enum: ['ORG_ADMIN', 'COMPLIANCE_OFFICER', 'MANAGER', 'ANALYST', 'VIEWER'],
  })
  @IsOptional()
  @IsEnum(AppRole)
  appRole?: AppRole;
}

export class ScimGroupDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  externalId?: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  displayName!: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  members?: string[];

  @ApiPropertyOptional({ enum: AppRole })
  @IsOptional()
  @IsEnum(AppRole)
  mappedRole?: AppRole;
}

export class ScimConfigDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @ApiPropertyOptional({
    description: 'Plain bearer token; stored hashed server-side',
  })
  @IsOptional()
  @IsString()
  @MinLength(16)
  bearerToken?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  baseUrl?: string;
}

export class ScimMappingDto {
  @ApiProperty()
  @IsString()
  scimGroupExternalId!: string;

  @ApiProperty({ enum: AppRole })
  @IsEnum(AppRole)
  mappedRole!: AppRole;
}
