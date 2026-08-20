import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { FlatList, RefreshControl, SafeAreaView, Text, View } from 'react-native';

import { EmptyState, PropertyCard, PropertyCardSkeleton } from '../components';
import { useFavoritesQuery, useToggleFavorite } from '../hooks/useFavorites';
import type { SavedStackParamList } from '../navigation/types';

export default function SavedScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<SavedStackParamList>>();
  const { data, isLoading, isError, isRefetching, refetch } = useFavoritesQuery();
  const toggleFavorite = useToggleFavorite();

  return (
    <SafeAreaView className="flex-1 bg-ivory">
      <View className="px-6 pb-2 pt-4">
        <Text className="font-sans-bold text-3xl text-charcoal">Saved</Text>
      </View>

      {isLoading ? (
        <View className="gap-4 px-6 pt-2">
          {[0, 1, 2].map((i) => (
            <PropertyCardSkeleton key={i} />
          ))}
        </View>
      ) : isError || !data ? (
        <EmptyState
          icon="alert-circle-outline"
          title="Something went wrong."
          message="Please try again."
          actionLabel="Retry"
          onAction={() => refetch()}
        />
      ) : data.length > 0 ? (
        <FlatList
          data={data}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingTop: 4, paddingBottom: 24 }}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
          renderItem={({ item }) => (
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
                favorited
                onPress={() => navigation.navigate('PropertyDetail', { propertyId: item.id })}
                onPressFavorite={() => toggleFavorite.mutate(item.id)}
              />
            </View>
          )}
        />
      ) : (
        <EmptyState icon="heart-outline" title="Your next home starts here." />
      )}
    </SafeAreaView>
  );
}
