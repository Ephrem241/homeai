import { Ionicons } from '@expo/vector-icons';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { CompositeNavigationProp } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Pressable, SafeAreaView, ScrollView, Text, View } from 'react-native';

import {
  AiSearchReviewSheet,
  Button,
  LocationCard,
  LocationCardSkeleton,
  PropertyCard,
  PropertyCardSkeleton,
  SearchBar,
} from '../components';
import type { AiSearchDraft } from '../components';
import type { ParsedSearchResult } from '../api/types';
import { usePopularLocationsQuery, useRecommendedPropertiesQuery } from '../hooks/useProperties';
import { useFavoritedIds, useToggleFavorite } from '../hooks/useFavorites';
import { useParseSearch } from '../hooks/useParseSearch';
import type { HomeStackParamList, RootTabParamList, SearchResultsParams } from '../navigation/types';
import { colors } from '../theme/tokens';

type HomeScreenNavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<HomeStackParamList>,
  BottomTabNavigationProp<RootTabParamList>
>;

const QUICK_ACTIONS: {
  key: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  params: { purpose?: 'BUY' | 'RENT'; type?: 'LAND' | 'COMMERCIAL' };
}[] = [
  { key: 'buy', label: 'Buy', icon: 'key-outline', params: { purpose: 'BUY' } },
  { key: 'rent', label: 'Rent', icon: 'home-outline', params: { purpose: 'RENT' } },
  { key: 'land', label: 'Land', icon: 'map-outline', params: { type: 'LAND' } },
  { key: 'commercial', label: 'Commercial', icon: 'storefront-outline', params: { type: 'COMMERCIAL' } },
];

export default function HomeScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<HomeScreenNavigationProp>();

  const recommended = useRecommendedPropertiesQuery(8);
  const popularLocations = usePopularLocationsQuery(6);
  const favoritedIds = useFavoritedIds();
  const toggleFavorite = useToggleFavorite();
  const parseSearch = useParseSearch();

  const [searchQuery, setSearchQuery] = useState('');
  const [reviewResult, setReviewResult] = useState<ParsedSearchResult | null>(null);
  const [reviewVisible, setReviewVisible] = useState(false);

  function goToExplore(params?: SearchResultsParams) {
    navigation.navigate('ExploreTab', { screen: 'Explore', params });
  }

  async function handleSearchSubmit() {
    const trimmed = searchQuery.trim();
    if (!trimmed) {
      goToExplore();
      return;
    }

    try {
      const result = await parseSearch.mutateAsync(trimmed);
      setReviewResult(result);
    } catch {
      // AI parsing failed — the review sheet's "couldn't pick out any
      // details" path doubles as the plain-language fallback here too.
      setReviewResult({ understood: false });
    }
    setReviewVisible(true);
  }

  function handleReviewConfirm(draft: AiSearchDraft, fallbackToText: boolean) {
    setReviewVisible(false);
    if (fallbackToText) {
      goToExplore({ q: searchQuery.trim() });
    } else {
      goToExplore(draft);
    }
    setSearchQuery('');
  }

  return (
    <SafeAreaView className="flex-1 bg-ivory">
      <ScrollView className="flex-1" contentContainerClassName="gap-8 pb-10">
        <View className="gap-1 px-6 pt-4">
          <Text accessibilityRole="header" className="font-sans-bold text-3xl text-charcoal">
            {t('common.appName')}
          </Text>
          <Text className="font-sans text-base text-slate-gray">{t('common.tagline')}</Text>
        </View>

        <View className="gap-2 px-6">
          <SearchBar
            placeholder={t('home.searchPlaceholder')}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearchSubmit}
            onSearchPress={handleSearchSubmit}
            returnKeyType="search"
            editable={!parseSearch.isPending}
          />
          {parseSearch.isPending ? (
            <View className="flex-row items-center gap-2 px-1">
              <ActivityIndicator size="small" color={colors.navy} />
              <Text className="font-sans text-xs text-slate-gray">Understanding your search…</Text>
            </View>
          ) : null}
        </View>

        <View className="flex-row justify-between px-6">
          {QUICK_ACTIONS.map((action) => (
            <Pressable
              key={action.key}
              accessibilityRole="button"
              onPress={() => goToExplore(action.params)}
              className="items-center gap-2"
              style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
            >
              <View className="h-14 w-14 items-center justify-center rounded-full bg-navy">
                <Ionicons name={action.icon} size={22} color={colors.white} />
              </View>
              <Text className="font-sans-medium text-xs text-charcoal">{action.label}</Text>
            </Pressable>
          ))}
        </View>

        <View className="gap-3">
          <View className="flex-row items-center justify-between px-6">
            <Text className="font-sans-semibold text-lg text-charcoal">{t('home.recommended')}</Text>
            <Pressable onPress={() => goToExplore()}>
              <Text className="font-sans-medium text-sm text-navy">{t('home.seeAll')}</Text>
            </Pressable>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-4 px-6">
            {recommended.isLoading
              ? [0, 1].map((i) => (
                  <View key={i} className="w-64">
                    <PropertyCardSkeleton />
                  </View>
                ))
              : (recommended.data ?? []).map((property) => (
                  <View key={property.id} className="w-64">
                    <PropertyCard
                      title={property.title}
                      location={property.neighborhood ? `${property.neighborhood}, ${property.city}` : property.city}
                      price={property.price}
                      currency={property.currency}
                      period={property.purpose === 'RENT' ? 'mo' : undefined}
                      bedrooms={property.bedrooms ?? 0}
                      bathrooms={property.bathrooms ?? 0}
                      areaSqm={property.areaSqm ?? 0}
                      imageUrl={property.photo}
                      verificationStatus="verified"
                      favorited={favoritedIds.has(property.id)}
                      onPress={() => navigation.navigate('PropertyDetail', { propertyId: property.id })}
                      onPressFavorite={() => toggleFavorite.mutate(property.id)}
                    />
                  </View>
                ))}
          </ScrollView>
        </View>

        <View className="gap-3">
          <Text className="px-6 font-sans-semibold text-lg text-charcoal">{t('home.popularLocations')}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-3 px-6">
            {popularLocations.isLoading
              ? [0, 1, 2].map((i) => <LocationCardSkeleton key={i} />)
              : (popularLocations.data ?? []).map((location) => (
                  <LocationCard
                    key={location.id}
                    name={location.name}
                    propertyCount={location.propertyCount}
                    onPress={() =>
                      goToExplore({ neighborhoodId: location.id, locationLabel: location.name })
                    }
                  />
                ))}
          </ScrollView>
        </View>

        <View className="px-6">
          <Button
            label={t('home.componentLibraryCta')}
            variant="secondary"
            onPress={() => navigation.navigate('ComponentDemo')}
          />
        </View>
      </ScrollView>

      <AiSearchReviewSheet
        visible={reviewVisible}
        onClose={() => setReviewVisible(false)}
        query={searchQuery.trim()}
        result={reviewResult}
        onConfirm={handleReviewConfirm}
      />
    </SafeAreaView>
  );
}
