import { Ionicons } from '@expo/vector-icons';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { CompositeNavigationProp } from '@react-navigation/native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useState } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from 'react-native';

import { AppModal, Button, EmptyState, InvestmentAnalysisPanel, PriceBadge, PropertyScoreCard, VerificationBadge } from '../components';
import { useDemoUser } from '../hooks/useDemoUser';
import { useFavoritedIds, useToggleFavorite } from '../hooks/useFavorites';
import { usePropertyInsightQuery } from '../hooks/usePropertyInsight';
import { useReportProperty, usePropertyQuery } from '../hooks/useProperties';
import type { ExploreStackParamList, RootTabParamList } from '../navigation/types';
import { colors } from '../theme/tokens';

type PropertyDetailNavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<ExploreStackParamList>,
  BottomTabNavigationProp<RootTabParamList>
>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');

function Spec({ icon, value }: { icon: keyof typeof Ionicons.glyphMap; value: string }) {
  return (
    <View className="flex-1 items-center gap-1 rounded-md bg-mist py-3">
      <Ionicons name={icon} size={18} color={colors.slateGray} />
      <Text className="font-sans-semibold text-sm text-charcoal">{value}</Text>
    </View>
  );
}

export default function PropertyDetailScreen() {
  const route = useRoute<RouteProp<ExploreStackParamList, 'PropertyDetail'>>();
  const navigation = useNavigation<PropertyDetailNavigationProp>();
  const { propertyId } = route.params;

  const { data: user } = useDemoUser();
  const { data: property, isLoading, isError, refetch } = usePropertyQuery(propertyId);
  const insight = usePropertyInsightQuery(propertyId, user?.id);
  const favoritedIds = useFavoritedIds();
  const toggleFavorite = useToggleFavorite();
  const reportProperty = useReportProperty();
  const [activePhoto, setActivePhoto] = useState(0);
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [reported, setReported] = useState(false);

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-ivory">
        <View className="h-72 bg-mist" />
      </SafeAreaView>
    );
  }

  if (isError || !property) {
    return (
      <SafeAreaView className="flex-1 bg-ivory">
        <EmptyState
          icon="alert-circle-outline"
          title="Something went wrong."
          message="Please try again."
          actionLabel="Retry"
          onAction={() => refetch()}
        />
      </SafeAreaView>
    );
  }

  const favorited = favoritedIds.has(property.id);
  const photos = property.photos.length > 0 ? property.photos : [null];
  const locationLine = [property.neighborhood, property.city, property.country].filter(Boolean).join(', ');

  return (
    <SafeAreaView className="flex-1 bg-ivory">
      <ScrollView contentContainerClassName="pb-10">
        <View>
          <FlatList
            data={photos}
            keyExtractor={(_, index) => String(index)}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(event) => {
              const index = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
              setActivePhoto(index);
            }}
            renderItem={({ item }) =>
              item ? (
                <Image source={{ uri: item }} style={{ width: SCREEN_WIDTH, height: 288 }} resizeMode="cover" />
              ) : (
                <View style={{ width: SCREEN_WIDTH, height: 288 }} className="items-center justify-center bg-mist">
                  <Ionicons name="image-outline" size={40} color={colors.slateGray} />
                </View>
              )
            }
          />

          {photos.length > 1 ? (
            <View className="absolute bottom-3 w-full flex-row justify-center gap-1.5">
              {photos.map((_, index) => (
                <View
                  key={index}
                  className={`h-1.5 w-1.5 rounded-full ${index === activePhoto ? 'bg-white' : 'bg-white/50'}`}
                />
              ))}
            </View>
          ) : null}

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go back"
            onPress={() => navigation.goBack()}
            hitSlop={8}
            className="absolute left-4 top-4 h-9 w-9 items-center justify-center rounded-full bg-white/90"
          >
            <Ionicons name="chevron-back" size={20} color={colors.charcoal} />
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={favorited ? 'Remove from favorites' : 'Add to favorites'}
            onPress={() => toggleFavorite.mutate(property.id)}
            hitSlop={8}
            className="absolute right-4 top-4 h-9 w-9 items-center justify-center rounded-full bg-white/90"
          >
            <Ionicons
              name={favorited ? 'heart' : 'heart-outline'}
              size={18}
              color={favorited ? colors.error : colors.charcoal}
            />
          </Pressable>
        </View>

        <View className="gap-5 px-6 pt-5">
          <View className="gap-2">
            <View className="flex-row flex-wrap gap-2">
              <VerificationBadge status="verified" />
              {property.agentVerified ? <VerificationBadge status="agentVerified" /> : null}
            </View>
            <Text className="font-sans-bold text-2xl text-charcoal">{property.title}</Text>
            <View className="flex-row items-center gap-1">
              <Ionicons name="location-outline" size={16} color={colors.slateGray} />
              <Text className="font-sans text-sm text-slate-gray">{locationLine}</Text>
            </View>
            <PriceBadge
              price={property.price}
              currency={property.currency}
              period={property.purpose === 'RENT' ? 'mo' : undefined}
            />
          </View>

          <View className="flex-row gap-3">
            <Spec icon="bed-outline" value={`${property.bedrooms ?? 0} bed`} />
            <Spec icon="water-outline" value={`${property.bathrooms ?? 0} bath`} />
            <Spec icon="resize-outline" value={`${property.areaSqm ?? 0} m²`} />
          </View>

          <Button
            label="Ask AI about this property"
            variant="secondary"
            leftIcon={<Ionicons name="sparkles" size={16} color={colors.navy} />}
            onPress={() => navigation.navigate('PropertyAssistant', { propertyId: property.id })}
          />

          <View className="gap-2">
            <Text className="font-sans-semibold text-lg text-charcoal">About this property</Text>
            <Text className="font-sans text-base leading-6 text-slate-gray">{property.description}</Text>
          </View>

          {property.amenities.length > 0 ? (
            <View className="gap-2">
              <Text className="font-sans-semibold text-lg text-charcoal">Amenities</Text>
              <View className="flex-row flex-wrap gap-2">
                {property.amenities.map((amenity) => (
                  <View key={amenity} className="rounded-full bg-mist px-3 py-1.5">
                    <Text className="font-sans-medium text-xs capitalize text-charcoal">{amenity}</Text>
                  </View>
                ))}
              </View>
            </View>
          ) : null}

          <PropertyScoreCard insight={insight.data} isLoading={insight.isLoading} />

          <InvestmentAnalysisPanel
            insight={insight.data}
            isLoading={insight.isLoading}
            onUpgrade={() => navigation.navigate('ProfileTab', { screen: 'Pricing' })}
          />

          <View className="gap-2">
            <Text className="font-sans-semibold text-lg text-charcoal">Location</Text>
            <View className="h-40 items-center justify-center gap-1 rounded-lg bg-mist">
              <Ionicons name="map-outline" size={28} color={colors.slateGray} />
              <Text className="font-sans text-sm text-slate-gray">{locationLine}</Text>
              <Text className="px-8 text-center font-sans text-xs text-slate-gray">
                Interactive map arrives with a full device build.
              </Text>
            </View>
          </View>

          <View className="gap-3 rounded-lg border border-mist bg-white p-4">
            <Text className="font-sans-medium text-xs uppercase text-slate-gray">
              {property.contact.type === 'agent' ? 'Listed by agent' : 'Listed by owner'}
            </Text>
            <View className="flex-row items-center gap-2">
              <Text className="font-sans-semibold text-base text-charcoal">{property.contact.name}</Text>
              {property.contact.verified ? <VerificationBadge status="agentVerified" /> : null}
            </View>
            {property.contact.userId && property.contact.userId !== user?.id ? (
              <Button
                label={`Message ${property.contact.type === 'agent' ? 'agent' : 'owner'}`}
                variant="secondary"
                leftIcon={<Ionicons name="chatbubble-outline" size={16} color={colors.navy} />}
                onPress={() =>
                  navigation.navigate('ProfileTab', {
                    screen: 'MessageThread',
                    params: {
                      otherUserId: property.contact.userId as string,
                      otherUserName: property.contact.name,
                      propertyId: property.id,
                      propertyTitle: property.title,
                    },
                  })
                }
              />
            ) : null}
          </View>

          <Pressable
            accessibilityRole="button"
            onPress={() => setReportModalVisible(true)}
            disabled={reported}
            className="flex-row items-center justify-center gap-1.5 py-2"
          >
            <Ionicons name="flag-outline" size={14} color={colors.slateGray} />
            <Text className="font-sans-medium text-xs text-slate-gray">
              {reported ? 'Reported — thanks for letting us know' : 'Report this listing'}
            </Text>
          </Pressable>
        </View>
      </ScrollView>

      <AppModal visible={reportModalVisible} onClose={() => setReportModalVisible(false)} title="Report this listing?">
        <Text className="font-sans text-sm text-slate-gray">
          This listing will be hidden from search while our team reviews it.
        </Text>
        <View className="flex-row gap-3 pt-2">
          <View className="flex-1">
            <Button label="Cancel" variant="secondary" fullWidth onPress={() => setReportModalVisible(false)} />
          </View>
          <View className="flex-1">
            <Button
              label="Report"
              variant="primary"
              fullWidth
              loading={reportProperty.isPending}
              onPress={async () => {
                try {
                  await reportProperty.mutateAsync(property.id);
                  setReported(true);
                } finally {
                  setReportModalVisible(false);
                }
              }}
            />
          </View>
        </View>
      </AppModal>
    </SafeAreaView>
  );
}
