import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Linking, SafeAreaView, ScrollView, Text, View } from 'react-native';
import type { PurchasesPackage } from 'react-native-purchases';

import type { SubscriptionTier } from '../api/types';
import { Button, HeaderBar } from '../components';
import { useAuth } from '../hooks/useAuth';
import { useUpdateTier } from '../hooks/useUsers';
import { fetchCurrentOffering, isRevenueCatConfigured, purchase } from '../lib/purchases';
import { colors } from '../theme/tokens';

// Package/entitlement identifiers as configured in the RevenueCat dashboard
// — must match backend/src/webhooks/revenuecat-webhook.controller.ts's
// ENTITLEMENT_TO_TIER map.
const TIERS: { tier: SubscriptionTier; name: string; packageId?: string; fallbackPrice: string; features: string[] }[] = [
  {
    tier: 'FREE',
    name: 'Free',
    fallbackPrice: '$0',
    features: ['Browse, search & save properties', 'AI Property Score on every listing', '2 AI Designer generations / month'],
  },
  {
    tier: 'PLUS',
    name: 'Plus',
    packageId: 'plus',
    fallbackPrice: '$4.99/mo',
    features: ['Everything in Free', 'Full Investment Analysis', 'Unlimited AI Designer generations'],
  },
  {
    tier: 'PRO',
    name: 'Pro',
    packageId: 'pro',
    fallbackPrice: '$9.99/mo',
    features: ['Everything in Plus', 'Priority saved-search alerts', 'Early access to new listings'],
  },
  {
    tier: 'AGENT_PRO',
    name: 'Agent Pro',
    packageId: 'agent_pro',
    fallbackPrice: '$29.99/mo',
    features: ['Everything in Pro', 'Boosted listing visibility', 'Advanced agent analytics'],
  },
];

// Real payment processing was an explicit MVP non-goal through Phase 7
// (CLAUDE.md §7) — this screen's "Choose a plan" button used to just set
// the tier directly. When RevenueCat is configured (Android only —
// EXPO_PUBLIC_REVENUECAT_GOOGLE_API_KEY), it now runs a real Google Play
// Billing purchase instead, and the tier is set by RevenueCat's webhook,
// never by this screen. With no key configured, the old stub path stays as
// a working fallback so the gating built around subscription tier remains
// testable without a Play Console setup.
export default function PricingScreen() {
  const { user, refreshUser } = useAuth();
  const updateTier = useUpdateTier();
  const [purchasingTier, setPurchasingTier] = useState<SubscriptionTier | null>(null);
  const [error, setError] = useState<string | null>(null);

  const offering = useQuery({
    queryKey: ['revenueCatOffering'],
    queryFn: fetchCurrentOffering,
    enabled: isRevenueCatConfigured,
    staleTime: Infinity,
  });

  function packageFor(packageId: string | undefined): PurchasesPackage | undefined {
    if (!packageId || !offering.data) return undefined;
    return offering.data.availablePackages.find((pkg) => pkg.identifier === packageId);
  }

  async function handleChoose(tier: SubscriptionTier, packageId: string | undefined) {
    setError(null);

    if (!isRevenueCatConfigured) {
      updateTier.mutate(tier);
      return;
    }

    const pkg = packageFor(packageId);
    if (!pkg) {
      setError("This plan isn't available for purchase right now.");
      return;
    }

    setPurchasingTier(tier);
    try {
      const result = await purchase(pkg);
      if (result.status === 'error') {
        setError(result.message);
      } else if (result.status === 'success') {
        // The webhook is the source of truth and may take a moment to land
        // — this just refreshes eagerly so the UI updates as soon as
        // possible rather than waiting for the next natural refetch.
        await refreshUser();
      }
    } finally {
      setPurchasingTier(null);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-ivory">
      <HeaderBar title="Plans" />

      <ScrollView contentContainerClassName="gap-4 px-6 py-6">
        {TIERS.map((option) => {
          const isCurrent = user?.subscriptionTier === option.tier;
          const isPremium = option.tier !== 'FREE';
          const pkg = packageFor(option.packageId);
          const price = isRevenueCatConfigured && pkg ? pkg.product.priceString : option.fallbackPrice;
          const purchasable = !isRevenueCatConfigured || Boolean(pkg);

          return (
            <View
              key={option.tier}
              className={`gap-3 rounded-lg border bg-white p-4 ${isCurrent ? 'border-navy' : 'border-mist'}`}
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-2">
                  <Text className="font-sans-bold text-lg text-charcoal">{option.name}</Text>
                  {isPremium ? <Ionicons name="star" size={14} color={colors.gold} /> : null}
                </View>
                <Text className="font-sans-semibold text-base text-charcoal">{price}</Text>
              </View>

              <View className="gap-1.5">
                {option.features.map((feature) => (
                  <View key={feature} className="flex-row items-start gap-2">
                    <Ionicons name="checkmark" size={16} color={colors.success} />
                    <Text className="flex-1 font-sans text-sm text-slate-gray">{feature}</Text>
                  </View>
                ))}
              </View>

              {isPremium ? (
                <Button
                  label={isCurrent ? 'Current plan' : `Choose ${option.name}`}
                  variant={isCurrent ? 'secondary' : 'premium'}
                  disabled={isCurrent || !purchasable}
                  loading={
                    isRevenueCatConfigured
                      ? purchasingTier === option.tier
                      : updateTier.isPending && updateTier.variables === option.tier
                  }
                  onPress={() => handleChoose(option.tier, option.packageId)}
                />
              ) : isCurrent ? (
                <Button label="Current plan" variant="secondary" disabled />
              ) : isRevenueCatConfigured ? (
                <Button
                  label="Manage in Google Play"
                  variant="secondary"
                  onPress={() => Linking.openURL('https://play.google.com/store/account/subscriptions')}
                />
              ) : (
                <Button
                  label="Choose Free"
                  variant="primary"
                  loading={updateTier.isPending && updateTier.variables === option.tier}
                  onPress={() => handleChoose(option.tier, option.packageId)}
                />
              )}
            </View>
          );
        })}

        {error ? <Text className="px-2 font-sans text-sm text-error">{error}</Text> : null}

        <Text className="px-2 text-center font-sans text-xs text-slate-gray">
          {isRevenueCatConfigured
            ? 'Billed through Google Play. Cancel anytime in the Play Store.'
            : 'This is a demo pricing screen — no payment is collected and no charge is made.'}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
