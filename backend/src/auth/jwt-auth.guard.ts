import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { resolveUserId, type AuthedRequest } from './jwt.util';

// Rejects the request unless a valid Bearer token is present. Attaches
// `req.user = { id }` for @CurrentUser() to read.
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwt: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<AuthedRequest>();
    const userId = await resolveUserId(req, this.jwt);
    if (!userId) {
      throw new UnauthorizedException('Sign in required.');
    }
    req.user = { id: userId };
    return true;
  }
}
