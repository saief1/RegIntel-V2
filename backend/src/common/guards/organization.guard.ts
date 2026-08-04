import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Request } from 'express';
import { PrismaService } from '../prisma/prisma.service';

export const ORGANIZATION_HEADER = 'x-organization-id';

@Injectable()
export class OrganizationGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const userId = request.user?.userId;
    if (!userId) {
      throw new ForbiddenException({
        code: 'FORBIDDEN',
        message: 'Authentication required.',
      });
    }

    const organizationId = request.header(ORGANIZATION_HEADER)?.trim();
    if (!organizationId) {
      throw new ForbiddenException({
        code: 'ORG_CONTEXT_REQUIRED',
        message: 'X-Organization-Id header is required for this request.',
      });
    }

    const membership = await this.prisma.organizationMembership.findFirst({
      where: {
        userId,
        organizationId,
        status: 'ACTIVE',
      },
    });

    if (!membership) {
      throw new ForbiddenException({
        code: 'ORG_ACCESS_DENIED',
        message: 'You are not a member of this organization.',
      });
    }

    request.organizationId = organizationId;
    request.membershipRole = membership.role;
    return true;
  }
}
