import { Injectable, NotFoundException } from '@nestjs/common';
import type { SubscriptionTier } from '@prisma/client';

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

  // Real payment processing is an explicit MVP non-goal (CLAUDE.md §7) — this
  // stands in for a payment provider, immediately setting the tier so the
  // rest of the gating logic (Phase 7) can be built and tested end to end.
  async updateTier(id: string, tier: SubscriptionTier) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return this.prisma.user.update({ where: { id }, data: { subscriptionTier: tier } });
  }
}
