import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import type { AuthedRequest } from './jwt.util';

// Requires JwtAuthGuard (or OptionalJwtAuthGuard) to have run first so
// req.user is populated. Returns the { id } payload — handlers that need
// more than the id look it up via PrismaService.
export const CurrentUser = createParamDecorator((_data: unknown, ctx: ExecutionContext) => {
  const req = ctx.switchToHttp().getRequest<AuthedRequest>();
  return req.user;
});
