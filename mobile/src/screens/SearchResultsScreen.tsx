import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { FlatList, Pressable, RefreshControl, SafeAreaView, Text, View } from 'react-native';

import {
  Button,
  EmptyState,
  FilterChip,
  FiltersSheet,
  LocationPickerSheet,
  PropertyCard,
  PropertyCardSkeleton,
  SearchBar,
  SegmentedTabs,
} from '../components';
import type { FiltersValue } from '../components/FiltersSheet';
import type { LocationSearchResult, PropertyFilters, PropertyListItem, PropertyType } from '../api/types';
import { useFavoritedIds, useToggleFavorite } from '../hooks/useFavorites';
import { usePropertiesQuery } from '../hooks/useProperties';
import { useResponsive } from '../hooks/useResponsive';
import type { ExploreStackParamList, SearchResultsParams } from '../navigation/types';
import { colors } from '../theme/tokens';

const QUICK_TYPES: { label: string; value: PropertyType; icon: keyof typeof Ionicons.glyphMap }[] = [
  { label: 'Apartment', value: 'APARTMENT', icon: 'business-outline' },
  { label: 'House', value: 'HOUSE', icon: 'home-outline' },
  { label: 'Land', value: 'LAND', icon: 'map-outline' },
  { label: 'Commercial', value: 'COMMERCIAL', icon: 'storefront-outline' },
];

type ActiveFilters = FiltersValue & {
  countryId?: string;
  cityId?: string;
  neighborhoodId?: string;
  locationLabel?: string;
};

// Route params carry numeric min/max price (from AI parsing or a quick
// action); FiltersSheet edits them as text-input strings. Convert once here
// so both entry points land in the same shape.
function paramsToFilters(params: SearchResultsParams): ActiveFilters {
  return {
    purpose: params?.purpose,
    type: params?.type,
    countryId: params?.countryId,
    cityId: params?.cityId,
    neighborhoodId: params?.neighborhoodId,
    locationLabel: params?.locationLabel,
    bedrooms: params?.bedrooms,
    minPrice: params?.minPrice !== undefined ? String(params.minPrice) : undefined,
    maxPrice: params?.maxPrice !== undefined ? String(params.maxPrice) : undefined,
    currency: params?.currency,
    furnished: params?.furnished,
    parking: params?.parking,
  };
}

export default function SearchResultsScreen() {
  const route = useRoute<RouteProp<ExploreStackParamList, 'Explore'>>();
  const navigation = useNavigation<NativeStackNavigationProp<ExploreStackParamList>>();

  const [query, setQuery] = useState(route.params?.q ?? '');
  const [filters, setFilters] = useState<ActiveFilters>(paramsToFilters(route.params));
  const [unresolvedLocation, setUnresolvedLocation] = useState(route.params?.unresolvedLocation);
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [locationPickerVisible, setLocationPickerVisible] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [compareMode, setCompareMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!route.params) return;
    setQuery(route.params.q ?? '');
    setFilters(paramsToFilters(route.params));
    setUnresolvedLocation(route.params.unresolvedLocation);
  }, [route.params]);

  const queryFilters: PropertyFilters = {
    q: query.trim() || undefined,
    purpose: filters.purpose,
    type: filters.type,
    countryId: filters.countryId,
    cityId: filters.cityId,
    neighborhoodId: filters.neighborhoodId,
    minPrice: filters.minPrice ? Number(filters.minPrice) : undefined,
    maxPrice: filters.maxPrice ? Number(filters.maxPrice) : undefined,
    currency: filters.currency,
    bedrooms: filters.bedrooms,
    furnished: filters.furnished,
    parking: filters.parking,
    limit: 50,
    sort: 'newest',
  };

  const { data, isLoading, isError, isRefetching, refetch } = usePropertiesQuery(queryFilters);
  const favoritedIds = useFavoritedIds();
  const toggleFavorite = useToggleFavorite();
  // CLAUDE.md §5 Phase 8 — tablet gets a grid, not a single stretched column.
  const { columns } = useResponsive();

  const hasActiveFilters = Boolean(
    filters.type ||
      filters.purpose ||
      filters.countryId ||
      filters.cityId ||
      filters.neighborhoodId ||
      filters.minPrice ||
      filters.maxPrice ||
      filters.currency ||
      filters.bedrooms ||
      filters.furnished ||
      filters.parking,
  );

  function clearAll() {
    setQuery('');
    setFilters({});
    setUnresolvedLocation(undefined);
  }

  function toggleCompareMode() {
    setCompareMode((prev) => !prev);
    setSelectedIds(new Set());
  }

  function toggleSelected(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else if (next.size < 4) {
        next.add(id);
      }
      return next;
    });
  }

  function handleSelectLocation(location: LocationSearchResult) {
    setFilters((prev) => ({
      ...prev,
      countryId: location.countryId,
      cityId: location.cityId,
      neighborhoodId: location.neighborhoodId,
      locationLabel: location.name,
    }));
    setLocationPickerVisible(false);
    setFiltersVisible(true);
  }

  function renderItem({ item }: { item: PropertyListItem }) {
    const selected = selectedIds.has(item.id);
    return (
      <View className={columns > 1 ? 'flex-1 pb-4' : 'px-6 pb-4'}>
        <View className={compareMode && selected ? 'rounded-lg border-2 border-navy' : ''}>
          <PropertyCard
            title={item.title}
            location={item.neighborhood ? `${item.neighborhood}, ${item.city}` : item.city}
            price={item.price}
            currency={item.currency}
            period={item.purpose === 'RENT' ? 'mo' : undefined}
            bedrooms={item.bedrooms ?? 0}
            bathrooms={item.bathrooms ?? 0}
            areaSqm={item.areaSqm ?? 0}
            imageUrl={item.photo}
            verificationStatus="verified"
            favorited={favoritedIds.has(item.id)}
            onPress={() =>
              compareMode
                ? toggleSelected(item.id)
                : navigation.navigate('PropertyDetail', { propertyId: item.id })
            }
            onPressFavorite={() => toggleFavorite.mutate(item.id)}
          />
        </View>
        {compareMode ? (
          <View className="absolute right-9 top-3 h-7 w-7 items-center justify-center rounded-full bg-white/90">
            <Ionicons
              name={selected ? 'checkmark-circle' : 'ellipse-outline'}
              size={20}
              color={selected ? colors.navy : colors.slateGray}
            />
          </View>
        ) : null}
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-ivory">
      <View className="gap-3 px-6 pb-3 pt-4">
        <SearchBar
          placeholder="Search city, neighborhood, or property"
          value={query}
          onChangeText={setQuery}
          onFilterPress={() => setFiltersVisible(true)}
        />

        {unresolvedLocation ? (
          <View className="flex-row items-center justify-between rounded-md bg-mist px-4 py-2.5">
            <Text className="flex-1 font-sans text-xs text-slate-gray">
              We couldn't match a location for "{unresolvedLocation}" — showing everything else.
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Dismiss"
              onPress={() => setUnresolvedLocation(undefined)}
              hitSlop={12}
            >
              <Ionicons name="close" size={16} color={colors.slateGray} />
            </Pressable>
          </View>
        ) : null}

        <View className="flex-row flex-wrap gap-2">
          {QUICK_TYPES.map((option) => (
            <FilterChip
              key={option.value}
              label={option.label}
              icon={option.icon}
              selected={filters.type === option.value}
              onPress={() =>
                setFilters((prev) => ({
                  ...prev,
                  type: prev.type === option.value ? undefined : option.value,
                }))
              }
            />
          ))}
        </View>

        <View className="flex-row items-center gap-3">
          <View className="flex-1">
            <SegmentedTabs
              options={[
                { label: 'List', value: 'list' },
                { label: 'Map', value: 'map' },
              ]}
              value={viewMode}
              onChange={(next) => setViewMode(next as 'list' | 'map')}
            />
          </View>
          <Pressable accessibilityRole="button" onPress={toggleCompareMode} hitSlop={8}>
            <Text className={`font-sans-medium text-sm ${compareMode ? 'text-error' : 'text-navy'}`}>
              {compareMode ? 'Cancel' : 'Compare'}
            </Text>
          </Pressable>
        </View>
      </View>

      {viewMode === 'map' ? (
        <View className="flex-1 items-center justify-center px-8">
          <View className="h-14 w-14 items-center justify-center rounded-full bg-mist">
            <Ionicons name="map-outline" size={24} color={colors.slateGray} />
          </View>
          <Text className="mt-3 text-center font-sans-semibold text-base text-charcoal">
            Map view is on its way.
          </Text>
          <Text className="mt-1 text-center font-sans text-sm text-slate-gray">
            Price-marker map browsing arrives once the app is running on a full device build. Use list
            view for now.
          </Text>
        </View>
      ) : isLoading ? (
        <View className="gap-4 px-6 pt-2">
          {[0, 1, 2].map((i) => (
            <PropertyCardSkeleton key={i} />
          ))}
        </View>
      ) : isError || !data ? (
        // `!data` also covers a query stuck "paused" with no result (e.g. no
        // network) — same user-facing fallback as a hard error.
        <EmptyState
          icon="alert-circle-outline"
          title="Something went wrong."
          message="Please try again."
          actionLabel="Retry"
          onAction={() => refetch()}
        />
      ) : data.data.length > 0 ? (
        <FlatList
          key={columns}
          data={data.data}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          numColumns={columns}
          columnWrapperStyle={columns > 1 ? { gap: 16, paddingHorizontal: 24 } : undefined}
          contentContainerStyle={{ paddingTop: 4, paddingBottom: 24 }}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
          ListHeaderComponent={
            <Text className="px-6 pb-3 font-sans text-sm text-slate-gray">
              {data.total} {data.total === 1 ? 'property' : 'properties'}
            </Text>
          }
        />
      ) : (
        <EmptyState
          icon="search-outline"
          title="We couldn't find an exact match."
          message="Try expanding your search or let AI find similar properties."
          actionLabel={hasActiveFilters || query ? 'Expand search' : undefined}
          onAction={hasActiveFilters || query ? clearAll : undefined}
        />
      )}

      {compareMode && selectedIds.size > 0 ? (
        <View className="gap-2 border-t border-mist bg-white px-6 py-3">
          <Text className="font-sans text-xs text-slate-gray">
            {selectedIds.size < 2
              ? 'Select at least 2 properties to compare (up to 4).'
              : `${selectedIds.size} selected`}
          </Text>
          <Button
            label={`Compare (${selectedIds.size})`}
            variant="primary"
            fullWidth
            disabled={selectedIds.size < 2}
            onPress={() => navigation.navigate('Compare', { propertyIds: Array.from(selectedIds) })}
          />
        </View>
      ) : null}

      <FiltersSheet
        visible={filtersVisible}
        onClose={() => setFiltersVisible(false)}
        value={filters}
        locationLabel={filters.locationLabel}
        onPressLocation={() => {
          setFiltersVisible(false);
          setLocationPickerVisible(true);
        }}
        onApply={(next) => {
          // `next` is the sheet's full draft for the FiltersValue-shaped
          // fields (purpose/type/price/bedrooms/currency) — including a
          // Reset, which sends `{}` to explicitly clear them. Location
          // fields aren't part of that draft, so they're carried over as-is.
          setFilters((prev) => ({
            countryId: prev.countryId,
            cityId: prev.cityId,
            neighborhoodId: prev.neighborhoodId,
            locationLabel: prev.locationLabel,
            ...next,
          }));
          setFiltersVisible(false);
        }}
      />

      <LocationPickerSheet
        visible={locationPickerVisible}
        onClose={() => setLocationPickerVisible(false)}
        onSelect={handleSelectLocation}
      />
    </SafeAreaView>
  );
}
