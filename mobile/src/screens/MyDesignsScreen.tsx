import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { FlatList, Image, Pressable, SafeAreaView, Text, View } from 'react-native';

import { EmptyState, HeaderBar, SkeletonBlock } from '../components';
import { useMyDesignsQuery } from '../hooks/useDesigns';
import { useResponsive } from '../hooks/useResponsive';
import type { AIStackParamList } from '../navigation/types';

const COLUMN_GAP = 12;

function DesignTileSkeleton() {
  return (
    <View className="flex-1 overflow-hidden rounded-lg border border-mist bg-white">
      <SkeletonBlock className="h-32 w-full" />
      <View className="gap-1 p-2.5">
        <SkeletonBlock className="h-3 w-2/3 rounded-sm" />
        <SkeletonBlock className="h-3 w-1/2 rounded-sm" />
      </View>
    </View>
  );
}

export default function MyDesignsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<AIStackParamList>>();
  const designs = useMyDesignsQuery();
  // CLAUDE.md §5 Phase 8 — tablet gets an extra column rather than the same
  // two-up grid just stretched wider.
  const { isTablet } = useResponsive();
  const numColumns = isTablet ? 3 : 2;

  return (
    <SafeAreaView className="flex-1 bg-ivory">
      <HeaderBar title="My Designs" />

      {designs.isLoading ? (
        <FlatList
          key={numColumns}
          data={[0, 1, 2, 3]}
          keyExtractor={(i) => String(i)}
          numColumns={numColumns}
          contentContainerStyle={{ padding: 24, gap: COLUMN_GAP }}
          columnWrapperStyle={{ gap: COLUMN_GAP }}
          renderItem={() => <DesignTileSkeleton />}
        />
      ) : designs.isError ? (
        <EmptyState
          icon="alert-circle-outline"
          title="Something went wrong."
          message="Please try again."
          actionLabel="Retry"
          onAction={() => designs.refetch()}
        />
      ) : designs.data && designs.data.length > 0 ? (
        <FlatList
          key={numColumns}
          data={designs.data}
          keyExtractor={(item) => item.id}
          numColumns={numColumns}
          contentContainerStyle={{ padding: 24, gap: COLUMN_GAP }}
          columnWrapperStyle={{ gap: COLUMN_GAP }}
          renderItem={({ item }) => (
            <Pressable
              accessibilityRole="button"
              onPress={() => navigation.navigate('DesignDetail', { designId: item.id })}
              className="flex-1 overflow-hidden rounded-lg border border-mist bg-white"
            >
              <Image
                source={{ uri: item.generatedImage ?? item.originalImage }}
                className="h-32 w-full"
                resizeMode="cover"
              />
              <View className="gap-0.5 p-2.5">
                <Text numberOfLines={1} className="font-sans-semibold text-xs text-charcoal">
                  {item.style}
                </Text>
                <Text numberOfLines={1} className="font-sans text-xs text-slate-gray">
                  {item.roomType}
                </Text>
              </View>
            </Pressable>
          )}
        />
      ) : (
        <EmptyState icon="color-palette-outline" title="Your redesigns will show up here." />
      )}
    </SafeAreaView>
  );
}
