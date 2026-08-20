import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

import { colors } from '../theme/tokens';
import SkeletonBlock from './Skeleton';

export default function LocationCard({
  name,
  propertyCount,
  onPress,
}: {
  name: string;
  propertyCount: number;
  onPress?: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      className="w-40 overflow-hidden rounded-lg border border-mist bg-white"
      style={({ pressed }) => ({ opacity: pressed ? 0.9 : 1 })}
    >
      <View className="h-24 items-center justify-center bg-mist">
        <Ionicons name="map-outline" size={24} color={colors.slateGray} />
      </View>
      <View className="gap-0.5 p-3">
        <Text numberOfLines={1} className="font-sans-semibold text-sm text-charcoal">
          {name}
        </Text>
        <Text className="font-sans text-xs text-slate-gray">
          {propertyCount} {propertyCount === 1 ? 'property' : 'properties'}
        </Text>
      </View>
    </Pressable>
  );
}

export function LocationCardSkeleton() {
  return (
    <View className="w-40 overflow-hidden rounded-lg border border-mist bg-white">
      <SkeletonBlock className="h-24 w-full" />
      <View className="gap-1.5 p-3">
        <SkeletonBlock className="h-3.5 w-3/4 rounded-sm" />
        <SkeletonBlock className="h-3 w-1/2 rounded-sm" />
      </View>
    </View>
  );
}
