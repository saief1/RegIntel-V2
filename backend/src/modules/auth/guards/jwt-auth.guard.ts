import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest<TUser>(err: Error | null, user: TUser): TUser {
    if (err || !user) {
      throw (
        err ??
        new UnauthorizedException({
          code: 'AUTH_INVALID_TOKEN',
          message: 'Access token has expired or is invalid.',
        })
      );
    }
    return user;
  }
}
