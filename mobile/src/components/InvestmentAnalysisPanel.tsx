import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

import type { PropertyInsight } from '../api/types';
import { colors } from '../theme/tokens';
import SkeletonBlock from './Skeleton';

const CATEGORY_CONFIG: Record<
  NonNullable<PropertyInsight['investmentCategory']>,
  { label: string; className: string; textClassName: string; icon: keyof typeof Ionicons.glyphMap }
> = {
  STRONG: { label: 'Strong', className: 'bg-success', textClassName: 'text-white', icon: 'trending-up' },
  MODERATE: { label: 'Moderate', className: 'bg-gold', textClassName: 'text-charcoal', icon: 'remove' },
  NEEDS_REVIEW: { label: 'Needs review', className: 'bg-mist', textClassName: 'text-slate-gray', icon: 'help-circle-outline' },
};

// Gold accent used sparingly, per CLAUDE.md §2 — a "Premium" marker only for
// now; Phase 7 wires the actual subscription gate. Every claim here is
// explicitly framed as an AI estimate, never as financial advice.
export default function InvestmentAnalysisPanel({
  insight,
  isLoading,
}: {
  insight?: PropertyInsight;
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <View className="gap-3 rounded-lg border border-gold/40 bg-white p-4">
        <SkeletonBlock className="h-4 w-40 rounded-sm" />
        <SkeletonBlock className="h-6 w-24 rounded-full" />
        <SkeletonBlock className="h-12 w-full rounded-sm" />
      </View>
    );
  }

  if (!insight || !insight.available || !insight.investmentCategory) {
    return null;
  }

  const category = CATEGORY_CONFIG[insight.investmentCategory];

  return (
    <View className="gap-3 rounded-lg border border-gold/40 bg-white p-4">
      <View className="flex-row items-center justify-between">
        <Text className="font-sans-semibold text-base text-charcoal">Investment Analysis</Text>
        <View className="flex-row items-center gap-1 rounded-full bg-gold px-2.5 py-1">
          <Ionicons name="star" size={11} color={colors.charcoal} />
          <Text className="font-sans-semibold text-xs text-charcoal">Premium</Text>
        </View>
      </View>

      <View className={`flex-row items-center gap-1.5 self-start rounded-full px-3 py-1.5 ${category.className}`}>
        <Ionicons name={category.icon} size={14} color={category.textClassName === 'text-white' ? colors.white : colors.charcoal} />
        <Text className={`font-sans-semibold text-sm ${category.textClassName}`}>{category.label}</Text>
      </View>

      {insight.investmentSummary ? (
        <Text className="font-sans text-sm leading-5 text-charcoal">{insight.investmentSummary}</Text>
      ) : null}

      <Text className="font-sans text-xs text-slate-gray">
        This is an AI-generated estimate, not guaranteed financial or investment advice. Consult a
        professional before making investment decisions.
      </Text>
    </View>
  );
}
