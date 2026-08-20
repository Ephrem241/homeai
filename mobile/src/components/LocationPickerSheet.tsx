import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import type { LocationSearchResult } from '../api/types';
import { useLocationSearchQuery } from '../hooks/useLocationSearch';
import { colors } from '../theme/tokens';
import BottomSheet from './BottomSheet';
import SearchBar from './SearchBar';
import SkeletonBlock from './Skeleton';

function LocationRowSkeleton() {
  return (
    <View className="flex-row items-center gap-3 px-2 py-3">
      <SkeletonBlock className="h-[18px] w-[18px] rounded-full" />
      <View className="flex-1 gap-1">
        <SkeletonBlock className="h-4 w-1/2 rounded-sm" />
        <SkeletonBlock className="h-3 w-1/3 rounded-sm" />
      </View>
    </View>
  );
}

// Search-driven rather than a browse tree — the same picker works for any
// country/city/neighborhood in the Location table, never an Ethiopia-specific
// list (CLAUDE.md §4).
export default function LocationPickerSheet({
  visible,
  onClose,
  onSelect,
}: {
  visible: boolean;
  onClose: () => void;
  onSelect: (location: LocationSearchResult) => void;
}) {
  const [query, setQuery] = useState('');
  const { data, isLoading } = useLocationSearchQuery(query);

  return (
    <BottomSheet visible={visible} onClose={onClose} title="Choose a location">
      <View className="gap-4">
        <SearchBar
          placeholder="Search city or neighborhood"
          value={query}
          onChangeText={setQuery}
          autoFocus
        />

        {isLoading ? (
          <View className="gap-1">
            {[0, 1, 2].map((i) => (
              <LocationRowSkeleton key={i} />
            ))}
          </View>
        ) : query.trim().length <= 1 ? (
          <Text className="px-1 font-sans text-sm text-slate-gray">
            Start typing to search any city or neighborhood.
          </Text>
        ) : data && data.length > 0 ? (
          <View className="gap-1">
            {data.map((location) => (
              <Pressable
                key={location.id}
                accessibilityRole="button"
                onPress={() => {
                  onSelect(location);
                  setQuery('');
                }}
                className="flex-row items-center gap-3 rounded-md px-2 py-3"
                style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
              >
                <Ionicons name="location-outline" size={18} color={colors.slateGray} />
                <View className="flex-1">
                  <Text className="font-sans-medium text-base text-charcoal">{location.name}</Text>
                  {location.breadcrumb ? (
                    <Text className="font-sans text-xs text-slate-gray">{location.breadcrumb}</Text>
                  ) : null}
                </View>
              </Pressable>
            ))}
          </View>
        ) : (
          <Text className="px-1 font-sans text-sm text-slate-gray">
            We couldn't find a matching location.
          </Text>
        )}
      </View>
    </BottomSheet>
  );
}
