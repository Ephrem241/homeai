import type { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';

export type AuthedRequest = Request & { user?: { id: string } };

function extractBearerToken(req: Request): string | undefined {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return undefined;
  return header.slice('Bearer '.length);
}

// Shared by JwtAuthGuard and OptionalJwtAuthGuard — verifies the token and
// returns the payload's user id, or undefined if there's no/invalid token.
// Callers decide whether a missing user is fatal.
export async function resolveUserId(req: Request, jwt: JwtService): Promise<string | undefined> {
  const token = extractBearerToken(req);
  if (!token) return undefined;
  try {
    const payload = await jwt.verifyAsync<{ sub: string }>(token);
    return payload.sub;
  } catch {
    return undefined;
  }
}
