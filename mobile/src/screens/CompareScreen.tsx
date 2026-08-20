import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQueries } from '@tanstack/react-query';
import { ActivityIndicator, Image, SafeAreaView, ScrollView, Text, View } from 'react-native';

import { fetchProperty } from '../api/properties';
import { EmptyState, VerificationBadge } from '../components';
import type { ExploreStackParamList } from '../navigation/types';
import { colors } from '../theme/tokens';

const CARD_WIDTH = 260;

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-center justify-between border-t border-mist py-2.5">
      <Text className="font-sans text-xs text-slate-gray">{label}</Text>
      <Text className="font-sans-medium text-sm text-charcoal">{value}</Text>
    </View>
  );
}

export default function CompareScreen() {
  const route = useRoute<RouteProp<ExploreStackParamList, 'Compare'>>();
  const navigation = useNavigation<NativeStackNavigationProp<ExploreStackParamList>>();
  const { propertyIds } = route.params;

  const results = useQueries({
    queries: propertyIds.map((id) => ({
      queryKey: ['property', id],
      queryFn: () => fetchProperty(id),
    })),
  });

  const isLoading = results.some((r) => r.isLoading);
  const properties = results.map((r) => r.data).filter((p): p is NonNullable<typeof p> => Boolean(p));

  return (
    <SafeAreaView className="flex-1 bg-ivory">
      <View className="flex-row items-center justify-between border-b border-mist px-6 py-4">
        <Text className="font-sans-semibold text-lg text-charcoal">Compare ({propertyIds.length})</Text>
        <Ionicons
          name="close"
          size={22}
          color={colors.charcoal}
          onPress={() => navigation.goBack()}
          suppressHighlighting
        />
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={colors.navy} />
        </View>
      ) : properties.length === 0 ? (
        <EmptyState icon="alert-circle-outline" title="Couldn't load these properties." message="Please try again." />
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={CARD_WIDTH + 12}
          decelerationRate="fast"
          contentContainerClassName="gap-3 px-6 py-4"
        >
          {properties.map((property) => (
            <View key={property.id} style={{ width: CARD_WIDTH }} className="rounded-lg border border-mist bg-white">
              <View className="h-32 items-center justify-center rounded-t-lg bg-mist">
                {property.photo ? (
                  <Image source={{ uri: property.photo }} className="h-32 w-full rounded-t-lg" resizeMode="cover" />
                ) : (
                  <Ionicons name="image-outline" size={28} color={colors.slateGray} />
                )}
              </View>
              <View className="gap-1 p-3">
                <VerificationBadge status="verified" />
                <Text numberOfLines={2} className="font-sans-semibold text-sm text-charcoal">
                  {property.title}
                </Text>
              </View>
              <View className="px-3 pb-3">
                <Row
                  label="Price"
                  value={`${property.currency} ${new Intl.NumberFormat('en-US').format(property.price)}${property.purpose === 'RENT' ? '/mo' : ''}`}
                />
                <Row label="Type" value={property.type} />
                <Row label="Purpose" value={property.purpose === 'RENT' ? 'Rent' : 'Buy'} />
                <Row label="Bedrooms" value={String(property.bedrooms ?? '—')} />
                <Row label="Bathrooms" value={String(property.bathrooms ?? '—')} />
                <Row label="Area" value={property.areaSqm ? `${property.areaSqm} m²` : '—'} />
                <Row label="Furnished" value={property.furnished ? 'Yes' : 'No'} />
                <Row label="Parking" value={property.parking ? 'Yes' : 'No'} />
                <Row label="Location" value={property.neighborhood ?? property.city} />
              </View>
            </View>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
