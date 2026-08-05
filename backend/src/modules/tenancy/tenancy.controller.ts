import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiHeader,
  ApiOperation,
  ApiProperty,
  ApiPropertyOptional,
  ApiTags,
} from '@nestjs/swagger';
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { Request } from 'express';
import { OrganizationGuard } from '../../common/guards/organization.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenancyService } from './tenancy.service';

class UpdateLimitsDto {
  @ApiPropertyOptional({
    enum: ['FREE', 'STARTER', 'PROFESSIONAL', 'ENTERPRISE'],
  })
  @IsOptional()
  @IsIn(['FREE', 'STARTER', 'PROFESSIONAL', 'ENTERPRISE'])
  plan?: 'FREE' | 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE';

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  maxSeats?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  maxApiRequestsPerDay?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  maxEmailsPerDay?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  rateLimitPerMinute?: number;

  @ApiPropertyOptional({ type: 'object', additionalProperties: true })
  @IsOptional()
  @IsObject()
  features?: Record<string, unknown>;
}

class FeatureFlagDto {
  @ApiProperty()
  @IsString()
  key!: string;

  @ApiProperty()
  @IsBoolean()
  enabled!: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;
}

@ApiTags('tenancy')
@ApiBearerAuth()
@ApiHeader({ name: 'X-Organization-Id', required: true })
@UseGuards(JwtAuthGuard, OrganizationGuard)
@Controller('tenancy')
export class TenancyController {
  constructor(private readonly tenancy: TenancyService) {}

  @Get('context')
  @ApiOperation({
    operationId: 'tenancyContext',
    summary: 'Tenant plan, quotas, and current usage',
  })
  context(@Req() req: Request) {
    return this.tenancy.getTenantContext(req.organizationId!);
  }

  @Patch('limits')
  @ApiOperation({
    operationId: 'tenancyUpdateLimits',
    summary: 'Update tenant plan/quotas (admin)',
  })
  updateLimits(@Req() req: Request, @Body() body: UpdateLimitsDto) {
    return this.tenancy.updateLimits(req.organizationId!, body);
  }

  @Post('feature-flags')
  @ApiOperation({
    operationId: 'tenancyUpsertFeatureFlag',
    summary: 'Upsert org-scoped feature flag',
  })
  upsertFlag(@Req() req: Request, @Body() body: FeatureFlagDto) {
    return this.tenancy.upsertFeatureFlag({
      key: body.key,
      enabled: body.enabled,
      description: body.description,
      organizationId: req.organizationId,
    });
  }
}
