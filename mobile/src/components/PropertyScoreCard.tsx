import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

import type { PropertyInsight } from '../api/types';
import { colors } from '../theme/tokens';
import SkeletonBlock from './Skeleton';

const BREAKDOWN_LABELS: { key: keyof NonNullable<PropertyInsight['breakdown']>; label: string }[] = [
  { key: 'location', label: 'Location' },
  { key: 'price', label: 'Price' },
  { key: 'space', label: 'Space' },
  { key: 'amenities', label: 'Amenities' },
  { key: 'condition', label: 'Condition' },
  { key: 'investment', label: 'Investment' },
];

function confidenceLabel(confidence: number) {
  if (confidence >= 0.7) return 'High confidence';
  if (confidence >= 0.4) return 'Medium confidence';
  return 'Low confidence';
}

function ScoreBar({ label, value }: { label: string; value: number }) {
  return (
    <View className="gap-1">
      <View className="flex-row items-center justify-between">
        <Text className="font-sans text-xs text-slate-gray">{label}</Text>
        <Text className="font-sans-medium text-xs text-charcoal">{Math.round(value)}</Text>
      </View>
      <View className="h-1.5 overflow-hidden rounded-full bg-mist">
        <View className="h-1.5 rounded-full bg-navy" style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
      </View>
    </View>
  );
}

// Every number here is a labeled AI estimate with a confidence indicator,
// never phrased as fact (CLAUDE.md §4).
export default function PropertyScoreCard({
  insight,
  isLoading,
}: {
  insight?: PropertyInsight;
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <View className="gap-3 rounded-lg border border-mist bg-white p-4">
        <SkeletonBlock className="h-4 w-32 rounded-sm" />
        <SkeletonBlock className="h-10 w-20 rounded-sm" />
        <SkeletonBlock className="h-16 w-full rounded-sm" />
      </View>
    );
  }

  if (!insight || !insight.available || insight.score === undefined || !insight.breakdown) {
    return (
      <View className="gap-1 rounded-lg border border-mist bg-white p-4">
        <Text className="font-sans-semibold text-base text-charcoal">AI Property Score</Text>
        <Text className="font-sans text-sm text-slate-gray">
          We couldn't generate a score for this property right now.
        </Text>
      </View>
    );
  }

  return (
    <View className="gap-4 rounded-lg border border-mist bg-white p-4">
      <View className="flex-row items-center justify-between">
        <Text className="font-sans-semibold text-base text-charcoal">AI Property Score</Text>
        <View className="flex-row items-center gap-1 rounded-full bg-mist px-2.5 py-1">
          <Ionicons name="sparkles" size={12} color={colors.slateGray} />
          <Text className="font-sans-medium text-xs text-slate-gray">AI estimate</Text>
        </View>
      </View>

      <View className="flex-row items-end gap-2">
        <Text className="font-sans-bold text-4xl text-charcoal">{Math.round(insight.score)}</Text>
        <Text className="pb-1 font-sans text-base text-slate-gray">/100</Text>
        {insight.confidence !== undefined ? (
          <Text className="pb-1.5 font-sans text-xs text-slate-gray"> · {confidenceLabel(insight.confidence)}</Text>
        ) : null}
      </View>

      <View className="gap-3">
        {BREAKDOWN_LABELS.map((item) => (
          <ScoreBar key={item.key} label={item.label} value={insight.breakdown![item.key]} />
        ))}
      </View>

      {insight.highlights && insight.highlights.length > 0 ? (
        <View className="gap-1.5 border-t border-mist pt-3">
          {insight.highlights.map((highlight) => (
            <View key={highlight} className="flex-row items-start gap-2">
              <View className="mt-1.5 h-1 w-1 rounded-full bg-slate-gray" />
              <Text className="flex-1 font-sans text-sm text-charcoal">{highlight}</Text>
            </View>
          ))}
        </View>
      ) : null}

      <Text className="font-sans text-xs text-slate-gray">
        AI-generated estimate — not a professional appraisal.
      </Text>
    </View>
  );
}
