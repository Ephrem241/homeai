import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { resolveUserId, type AuthedRequest } from './jwt.util';

// Populates req.user when a valid token is present, but never rejects —
// for endpoints that behave differently when signed in (e.g. subscription-
// gated content) but still work for anonymous browsing.
@Injectable()
export class OptionalJwtAuthGuard implements CanActivate {
  constructor(private readonly jwt: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<AuthedRequest>();
    const userId = await resolveUserId(req, this.jwt);
    if (userId) {
      req.user = { id: userId };
    }
    return true;
  }
}
