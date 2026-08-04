import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiHeader,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Request } from 'express';
import { OrganizationGuard } from '../../common/guards/organization.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { OrganizationsService } from './organizations.service';

@ApiTags('organizations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('organizations')
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @Get()
  @ApiOperation({
    operationId: 'organizationsList',
    summary: 'List organizations for the current user',
  })
  list(@Req() req: Request) {
    return this.organizationsService.listForUser(req.user!.userId);
  }

  @Post()
  @ApiOperation({
    operationId: 'organizationsCreate',
    summary: 'Create an organization and become OWNER',
  })
  create(@Req() req: Request, @Body() dto: CreateOrganizationDto) {
    return this.organizationsService.create(req.user!.userId, dto);
  }

  @Get(':id')
  @UseGuards(OrganizationGuard)
  @ApiHeader({
    name: 'X-Organization-Id',
    required: true,
    description: 'Must match path :id and an active membership',
  })
  @ApiOperation({
    operationId: 'organizationsGet',
    summary: 'Get an organization (X-Organization-Id + membership required)',
  })
  get(@Req() req: Request, @Param('id', new ParseUUIDPipe()) id: string) {
    if (req.organizationId !== id) {
      throw new ForbiddenException({
        code: 'ORG_CONTEXT_MISMATCH',
        message:
          'X-Organization-Id must match the organization id in the path.',
      });
    }
    return this.organizationsService.getByIdForMember(req.user!.userId, id);
  }
}
