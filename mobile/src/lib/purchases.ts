import { Platform } from 'react-native';
import Purchases, { PURCHASES_ERROR_CODE, type PurchasesOffering, type PurchasesPackage } from 'react-native-purchases';

// CLAUDE.md §7 named real payment processing an explicit MVP non-goal, so
// this stayed a client-side tier-set stub through Phase 7. RevenueCat +
// Google Play Billing is the real thing: purchases go through Play Billing,
// RevenueCat validates the receipt, and its webhook
// (backend/src/webhooks/revenuecat-webhook.controller.ts) is the only thing
// that ever actually sets User.subscriptionTier now — the app never sets
// its own tier directly when this is configured. Requires a custom dev
// client / EAS Build to actually run (see project memory) — this module is
// a no-op until EXPO_PUBLIC_REVENUECAT_GOOGLE_API_KEY is set.
const API_KEY = process.env.EXPO_PUBLIC_REVENUECAT_GOOGLE_API_KEY;

// Google Play Billing has no web equivalent — real purchases only ever make
// sense on Android, so this is unconditionally off on web regardless of
// whether a key is configured.
export const isRevenueCatConfigured = Boolean(API_KEY) && Platform.OS !== 'web';

let configured = false;

export function configurePurchases() {
  if (!API_KEY || configured) return;
  Purchases.configure({ apiKey: API_KEY });
  configured = true;
}

// Ties RevenueCat's app_user_id to our own User.id so the webhook can update
// the right row directly — call right after AuthProvider resolves a user.
export async function loginToPurchases(userId: string) {
  if (!isRevenueCatConfigured) return;
  await Purchases.logIn(userId);
}

export async function logoutFromPurchases() {
  if (!isRevenueCatConfigured) return;
  await Purchases.logOut();
}

export async function fetchCurrentOffering(): Promise<PurchasesOffering | null> {
  if (!isRevenueCatConfigured) return null;
  const offerings = await Purchases.getOfferings();
  return offerings.current;
}

export type PurchaseOutcome = { status: 'success' } | { status: 'cancelled' } | { status: 'error'; message: string };

export async function purchase(pkg: PurchasesPackage): Promise<PurchaseOutcome> {
  try {
    await Purchases.purchasePackage(pkg);
    return { status: 'success' };
  } catch (error) {
    const code = (error as { code?: PURCHASES_ERROR_CODE }).code;
    if (code === PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR) {
      return { status: 'cancelled' };
    }
    return { status: 'error', message: 'Something went wrong with your purchase. Please try again.' };
  }
}
