import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef } from 'react';
import { Animated, Image, Pressable, Text, View } from 'react-native';

import { colors } from '../theme/tokens';
import PriceBadge from './PriceBadge';
import SkeletonBlock from './Skeleton';
import VerificationBadge, { type VerificationStatus } from './VerificationBadge';

export type PropertyCardProps = {
  title: string;
  location: string;
  price: number;
  currency: string;
  period?: string;
  bedrooms: number;
  bathrooms: number;
  areaSqm: number;
  imageUrl?: string | null;
  verificationStatus?: VerificationStatus;
  favorited?: boolean;
  onPress?: () => void;
  onPressFavorite?: () => void;
};

function Spec({ icon, value }: { icon: keyof typeof Ionicons.glyphMap; value: string }) {
  return (
    <View className="flex-row items-center gap-1">
      <Ionicons name={icon} size={14} color={colors.slateGray} />
      <Text className="font-sans text-xs text-slate-gray">{value}</Text>
    </View>
  );
}

export default function PropertyCard({
  title,
  location,
  price,
  currency,
  period,
  bedrooms,
  bathrooms,
  areaSqm,
  imageUrl,
  verificationStatus,
  favorited = false,
  onPress,
  onPressFavorite,
}: PropertyCardProps) {
  // Card entrance per CLAUDE.md §5 Phase 8 — a light fade + rise on mount,
  // matching the timing/approach Skeleton.tsx already uses (core Animated
  // API, no added dependency).
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progress, { toValue: 1, duration: 280, useNativeDriver: true }).start();
  }, [progress]);

  return (
    <Animated.View
      style={{
        opacity: progress,
        transform: [{ translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) }],
      }}
    >
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        className="overflow-hidden rounded-lg border border-mist bg-white"
        style={({ pressed }) => ({ opacity: pressed ? 0.9 : 1 })}
      >
        <View className="h-40 items-center justify-center bg-mist">
          {imageUrl ? (
            <Image source={{ uri: imageUrl }} className="h-40 w-full" resizeMode="cover" />
          ) : (
            <Ionicons name="image-outline" size={32} color={colors.slateGray} />
          )}

          {verificationStatus ? (
            <View className="absolute left-3 top-3">
              <VerificationBadge status={verificationStatus} />
            </View>
          ) : null}

          <Pressable
            // No accessibilityRole="button" here — the card itself is already
            // a button (see below), and react-native-web renders that role as
            // a literal <button> element; nesting a second one is invalid HTML
            // and breaks hydration. accessibilityLabel still identifies this
            // as a control to screen readers.
            accessibilityLabel={favorited ? 'Remove from favorites' : 'Add to favorites'}
            onPress={onPressFavorite}
            hitSlop={8}
            className="absolute right-3 top-3 h-8 w-8 items-center justify-center rounded-full bg-white/90"
          >
            <Ionicons
              name={favorited ? 'heart' : 'heart-outline'}
              size={16}
              color={favorited ? colors.error : colors.charcoal}
            />
          </Pressable>

          <View className="absolute bottom-3 left-3">
            <PriceBadge price={price} currency={currency} period={period} />
          </View>
        </View>

        <View className="gap-2 p-3.5">
          <Text numberOfLines={1} className="font-sans-semibold text-base text-charcoal">
            {title}
          </Text>
          <View className="flex-row items-center gap-1">
            <Ionicons name="location-outline" size={14} color={colors.slateGray} />
            <Text numberOfLines={1} className="flex-1 font-sans text-sm text-slate-gray">
              {location}
            </Text>
          </View>
          <View className="flex-row gap-3 border-t border-mist pt-2">
            <Spec icon="bed-outline" value={`${bedrooms} bd`} />
            <Spec icon="water-outline" value={`${bathrooms} ba`} />
            <Spec icon="resize-outline" value={`${areaSqm} m²`} />
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

export function PropertyCardSkeleton() {
  return (
    <View className="overflow-hidden rounded-lg border border-mist bg-white">
      <SkeletonBlock className="h-40 w-full" />
      <View className="gap-2 p-3.5">
        <SkeletonBlock className="h-4 w-3/4 rounded-sm" />
        <SkeletonBlock className="h-3 w-1/2 rounded-sm" />
        <View className="flex-row gap-3 border-t border-mist pt-2">
          <SkeletonBlock className="h-3 w-10 rounded-sm" />
          <SkeletonBlock className="h-3 w-10 rounded-sm" />
          <SkeletonBlock className="h-3 w-10 rounded-sm" />
        </View>
      </View>
    </View>
  );
}
