import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { PermissionsService } from '../../permissions/permissions.service';
import { PERMISSIONS_KEY } from '../decorators/require-permissions.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly permissionsService: PermissionsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const required = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!required || required.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const userId = request.user?.userId;
    const organizationId = request.organizationId;
    if (!userId || !organizationId) {
      throw new ForbiddenException({
        code: 'PERMISSION_CONTEXT_REQUIRED',
        message:
          'Authentication and X-Organization-Id are required for this action.',
      });
    }

    const allowed = await this.permissionsService.hasAllPermissions(
      { userId, organizationId },
      required,
    );
    if (!allowed) {
      throw new ForbiddenException({
        code: 'PERMISSION_DENIED',
        message: `Missing required permission(s): ${required.join(', ')}`,
      });
    }
    return true;
  }
}
