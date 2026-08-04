import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SsoProviderType } from '@prisma/client';
import {
  IsBoolean,
  IsEnum,
  IsObject,
  IsOptional,
  IsString,
  IsUrl,
  MinLength,
} from 'class-validator';

export class UpsertSsoConfigurationDto {
  @ApiProperty({ enum: SsoProviderType })
  @IsEnum(SsoProviderType)
  providerType!: SsoProviderType;

  @ApiProperty({ example: 'Mock Okta OIDC' })
  @IsString()
  @MinLength(2)
  name!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @ApiPropertyOptional({ example: 'https://example.okta.com' })
  @IsOptional()
  @IsString()
  issuer?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  clientId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  clientSecret?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl({ require_tld: false })
  authorizationUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl({ require_tld: false })
  tokenUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl({ require_tld: false })
  jwksUrl?: string;

  @ApiPropertyOptional({ example: 'openid profile email' })
  @IsOptional()
  @IsString()
  scopes?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  entityId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl({ require_tld: false })
  acsUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl({ require_tld: false })
  metadataUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  certificate?: string;

  @ApiPropertyOptional({
    description: 'Provider-specific mock extras',
    type: 'object',
    additionalProperties: true,
  })
  @IsOptional()
  @IsObject()
  configJson?: Record<string, unknown>;
}

export class SsoMockCallbackDto {
  @ApiProperty({ description: 'Mock authorization code or SAML assertion' })
  @IsString()
  @MinLength(1)
  codeOrAssertion!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  state?: string;
}
