import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView, ScrollView, Text, View } from 'react-native';

import type { SubscriptionTier } from '../api/types';
import { Button, HeaderBar } from '../components';
import { useAuth } from '../hooks/useAuth';
import { useUpdateTier } from '../hooks/useUsers';
import { colors } from '../theme/tokens';

const TIERS: { tier: SubscriptionTier; name: string; price: string; features: string[] }[] = [
  {
    tier: 'FREE',
    name: 'Free',
    price: '$0',
    features: ['Browse, search & save properties', 'AI Property Score on every listing', '2 AI Designer generations / month'],
  },
  {
    tier: 'PLUS',
    name: 'Plus',
    price: '$4.99/mo',
    features: ['Everything in Free', 'Full Investment Analysis', 'Unlimited AI Designer generations'],
  },
  {
    tier: 'PRO',
    name: 'Pro',
    price: '$9.99/mo',
    features: ['Everything in Plus', 'Priority saved-search alerts', 'Early access to new listings'],
  },
  {
    tier: 'AGENT_PRO',
    name: 'Agent Pro',
    price: '$29.99/mo',
    features: ['Everything in Pro', 'Boosted listing visibility', 'Advanced agent analytics'],
  },
];

// Real payment processing is an explicit MVP non-goal (CLAUDE.md §7) — this
// stub sets the tier directly so the gating built for Investment Analysis
// and AI Designer generations (Phase 7) can be exercised end to end.
export default function PricingScreen() {
  const { user } = useAuth();
  const updateTier = useUpdateTier();

  return (
    <SafeAreaView className="flex-1 bg-ivory">
      <HeaderBar title="Plans" />

      <ScrollView contentContainerClassName="gap-4 px-6 py-6">
        {TIERS.map((option) => {
          const isCurrent = user?.subscriptionTier === option.tier;
          const isPremium = option.tier !== 'FREE';
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
                <Text className="font-sans-semibold text-base text-charcoal">{option.price}</Text>
              </View>

              <View className="gap-1.5">
                {option.features.map((feature) => (
                  <View key={feature} className="flex-row items-start gap-2">
                    <Ionicons name="checkmark" size={16} color={colors.success} />
                    <Text className="flex-1 font-sans text-sm text-slate-gray">{feature}</Text>
                  </View>
                ))}
              </View>

              <Button
                label={isCurrent ? 'Current plan' : `Choose ${option.name}`}
                variant={isCurrent ? 'secondary' : isPremium ? 'premium' : 'primary'}
                disabled={isCurrent}
                loading={updateTier.isPending && updateTier.variables === option.tier}
                onPress={() => updateTier.mutate(option.tier)}
              />
            </View>
          );
        })}

        <Text className="px-2 text-center font-sans text-xs text-slate-gray">
          This is a demo pricing screen — no payment is collected and no charge is made.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
