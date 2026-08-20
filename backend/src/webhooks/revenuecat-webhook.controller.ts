import { Body, Controller, Headers, Logger, Post, UnauthorizedException } from '@nestjs/common';
import type { SubscriptionTier } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import type { RevenueCatWebhookPayload } from './revenuecat-event.types';

// Entitlement identifiers as configured in the RevenueCat dashboard — must
// match the Play Console subscription products mapped to each. FREE has no
// entitlement (it's the default/no-purchase state).
const ENTITLEMENT_TO_TIER: Record<string, SubscriptionTier> = {
  plus: 'PLUS',
  pro: 'PRO',
  agent_pro: 'AGENT_PRO',
};
const TIER_RANK: Record<SubscriptionTier, number> = { FREE: 0, PLUS: 1, PRO: 2, AGENT_PRO: 3 };

// Events where the user now has (or still has) an active entitlement.
const GRANTS_ENTITLEMENT = new Set([
  'INITIAL_PURCHASE',
  'RENEWAL',
  'PRODUCT_CHANGE',
  'UNCANCELLATION',
  'SUBSCRIPTION_EXTENDED',
  'NON_RENEWING_PURCHASE',
  'TRANSFER',
  'TEMPORARY_ENTITLEMENT_GRANT',
]);
// CANCELLATION only turns off auto-renew — the entitlement stays active
// until it actually lapses, so only EXPIRATION downgrades to FREE.
const REVOKES_ENTITLEMENT = new Set(['EXPIRATION']);

function highestTier(entitlementIds: string[]): SubscriptionTier | undefined {
  return entitlementIds
    .map((id) => ENTITLEMENT_TO_TIER[id])
    .filter((tier): tier is SubscriptionTier => Boolean(tier))
    .sort((a, b) => TIER_RANK[b] - TIER_RANK[a])[0];
}

// Server-side source of truth for subscription tier (CLAUDE.md §7 — real
// payment processing was an MVP non-goal; this is what "real" looks like:
// the mobile app never sets its own tier, RevenueCat's webhook does, driven
// by actual Google Play Billing purchases). Configure this URL as a webhook
// endpoint in the RevenueCat dashboard, with REVENUECAT_WEBHOOK_SECRET set
// to the same value as the dashboard's "Authorization header value" field.
@Controller('webhooks')
export class RevenueCatWebhookController {
  private readonly logger = new Logger(RevenueCatWebhookController.name);

  constructor(private readonly prisma: PrismaService) {}

  @Post('revenuecat')
  async handle(@Headers('authorization') authHeader: string | undefined, @Body() body: RevenueCatWebhookPayload) {
    const expectedSecret = process.env.REVENUECAT_WEBHOOK_SECRET;
    if (expectedSecret && authHeader !== expectedSecret) {
      throw new UnauthorizedException();
    }

    const event = body?.event;
    // app_user_id is our own User.id — the mobile app calls
    // Purchases.logIn(user.id) right after signing in (hooks/useAuth.tsx),
    // so this is a direct id match, no lookup table needed.
    const userId = event?.app_user_id;
    if (!event || !userId) {
      return { received: true };
    }

    try {
      if (GRANTS_ENTITLEMENT.has(event.type)) {
        const tier = highestTier(event.entitlement_ids ?? []);
        if (tier) {
          await this.prisma.user.update({ where: { id: userId }, data: { subscriptionTier: tier } });
        }
      } else if (REVOKES_ENTITLEMENT.has(event.type)) {
        await this.prisma.user.update({ where: { id: userId }, data: { subscriptionTier: 'FREE' } });
      }
    } catch (error) {
      // A user id RevenueCat knows about but we don't (e.g. sandbox testing
      // before logIn() was ever called) shouldn't fail the webhook —
      // RevenueCat retries on non-2xx responses.
      this.logger.warn(`Could not apply ${event.type} for user ${userId}: ${(error as Error).message}`);
    }

    return { received: true };
  }
}
