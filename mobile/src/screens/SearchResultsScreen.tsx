import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { FlatList, RefreshControl, SafeAreaView, Text, View } from 'react-native';

import {
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
import type { ExploreStackParamList } from '../navigation/types';
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

export default function SearchResultsScreen() {
  const route = useRoute<RouteProp<ExploreStackParamList, 'Explore'>>();
  const navigation = useNavigation<NativeStackNavigationProp<ExploreStackParamList>>();

  const [query, setQuery] = useState(route.params?.q ?? '');
  const [filters, setFilters] = useState<ActiveFilters>({
    purpose: route.params?.purpose,
    type: route.params?.type,
    cityId: route.params?.cityId,
    neighborhoodId: route.params?.neighborhoodId,
    locationLabel: route.params?.locationLabel,
  });
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [locationPickerVisible, setLocationPickerVisible] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

  useEffect(() => {
    if (!route.params) return;
    setQuery(route.params.q ?? '');
    setFilters({
      purpose: route.params.purpose,
      type: route.params.type,
      cityId: route.params.cityId,
      neighborhoodId: route.params.neighborhoodId,
      locationLabel: route.params.locationLabel,
    });
  }, [route.params]);

  const queryFilters: PropertyFilters = {
    q: query.trim() || undefined,
    purpose: filters.purpose,
    type: filters.type,
    cityId: filters.cityId,
    neighborhoodId: filters.neighborhoodId,
    minPrice: filters.minPrice ? Number(filters.minPrice) : undefined,
    maxPrice: filters.maxPrice ? Number(filters.maxPrice) : undefined,
    currency: filters.currency,
    bedrooms: filters.bedrooms,
    limit: 50,
    sort: 'newest',
  };

  const { data, isLoading, isError, isRefetching, refetch } = usePropertiesQuery(queryFilters);
  const favoritedIds = useFavoritedIds();
  const toggleFavorite = useToggleFavorite();

  const hasActiveFilters = Boolean(
    filters.type ||
      filters.purpose ||
      filters.cityId ||
      filters.neighborhoodId ||
      filters.minPrice ||
      filters.maxPrice ||
      filters.currency ||
      filters.bedrooms,
  );

  function clearAll() {
    setQuery('');
    setFilters({});
  }

  function handleSelectLocation(location: LocationSearchResult) {
    setFilters((prev) => ({
      ...prev,
      countryId: location.type === 'country' ? location.id : undefined,
      cityId: location.type === 'city' ? location.id : undefined,
      neighborhoodId: location.type !== 'country' && location.type !== 'city' ? location.id : undefined,
      locationLabel: location.name,
    }));
    setLocationPickerVisible(false);
    setFiltersVisible(true);
  }

  function renderItem({ item }: { item: PropertyListItem }) {
    return (
      <View className="px-6 pb-4">
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
          onPress={() => navigation.navigate('PropertyDetail', { propertyId: item.id })}
          onPressFavorite={() => toggleFavorite.mutate(item.id)}
        />
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

        <SegmentedTabs
          options={[
            { label: 'List', value: 'list' },
            { label: 'Map', value: 'map' },
          ]}
          value={viewMode}
          onChange={(next) => setViewMode(next as 'list' | 'map')}
        />
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
          data={data.data}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
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
