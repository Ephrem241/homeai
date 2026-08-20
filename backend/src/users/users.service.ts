import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

// Temporary stand-in for real auth (Phone OTP — not built until a later
// phase; see CLAUDE.md §1). Returns a stable "current user" so the client
// can favorite/save properties end to end. Picks the earliest-created
// non-agent user rather than anything seed-specific, so it works with
// whatever locale's demo data is loaded — never an Ethiopia-specific lookup.
@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getDemoUser() {
    const existing = await this.prisma.user.findFirst({
      where: { role: { in: ['BUYER', 'RENTER'] } },
      orderBy: { createdAt: 'asc' },
    });
    if (existing) return existing;

    return this.prisma.user.create({
      data: { name: 'Demo User', phone: `+000${Date.now()}`, role: 'BUYER' },
    });
  }
}
