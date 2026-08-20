import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { UserRole } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import type { AuthedRequest } from './jwt.util';
import { ROLES_KEY } from './roles.decorator';

// Runs after JwtAuthGuard (req.user.id must already be set). Reads the
// user's role fresh from the DB rather than trusting the JWT payload, so a
// role change (e.g. admin revoked) takes effect on the very next request
// instead of waiting for the token to expire.
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const required = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!required || required.length === 0) return true;

    const req = context.switchToHttp().getRequest<AuthedRequest>();
    const user = req.user ? await this.prisma.user.findUnique({ where: { id: req.user.id } }) : null;
    if (!user || !required.includes(user.role)) {
      throw new ForbiddenException('Not allowed.');
    }
    return true;
  }
}
