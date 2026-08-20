import { Injectable, NotFoundException } from '@nestjs/common';
import type { SubscriptionTier } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

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
