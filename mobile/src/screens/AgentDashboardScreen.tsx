import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Pressable, SafeAreaView, ScrollView, Text, View } from 'react-native';

import type { PropertyStatus } from '../api/types';
import { Button, EmptyState, HeaderBar, SkeletonBlock } from '../components';
import { useAgentDashboardQuery, useAgentListingsQuery, useDemoAgent } from '../hooks/useAgent';
import type { ProfileStackParamList } from '../navigation/types';
import { colors } from '../theme/tokens';

const STATUS_LABELS: Record<PropertyStatus, string> = {
  DRAFT: 'Draft',
  PENDING: 'Pending verification',
  VERIFIED: 'Verified',
  REPORTED: 'Reported',
  UNAVAILABLE: 'Unavailable',
};

const STATUS_CLASSNAMES: Record<PropertyStatus, string> = {
  DRAFT: 'bg-mist text-slate-gray',
  PENDING: 'bg-warning text-white',
  VERIFIED: 'bg-success text-white',
  REPORTED: 'bg-error text-white',
  UNAVAILABLE: 'bg-mist text-slate-gray',
};

function StatTile({ label, value }: { label: string; value: number }) {
  return (
    <View className="flex-1 gap-1 rounded-lg border border-mist bg-white p-3">
      <Text className="font-sans-bold text-2xl text-charcoal">{value}</Text>
      <Text className="font-sans text-xs text-slate-gray">{label}</Text>
    </View>
  );
}

function StatTileSkeleton() {
  return (
    <View className="flex-1 gap-2 rounded-lg border border-mist bg-white p-3">
      <SkeletonBlock className="h-6 w-8 rounded-sm" />
      <SkeletonBlock className="h-3 w-12 rounded-sm" />
    </View>
  );
}

function ListingRowSkeleton() {
  return (
    <View className="flex-row items-center justify-between rounded-lg border border-mist bg-white p-3">
      <View className="flex-1 gap-1.5 pr-3">
        <SkeletonBlock className="h-4 w-2/3 rounded-sm" />
        <SkeletonBlock className="h-3 w-1/3 rounded-sm" />
      </View>
      <SkeletonBlock className="h-5 w-16 rounded-full" />
    </View>
  );
}

export default function AgentDashboardScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ProfileStackParamList>>();
  const { data: agent } = useDemoAgent();
  const dashboard = useAgentDashboardQuery(agent?.id);
  const listings = useAgentListingsQuery(agent?.id);

  return (
    <SafeAreaView className="flex-1 bg-ivory">
      <HeaderBar title="Agent Dashboard" />

      <ScrollView contentContainerClassName="gap-6 px-6 py-5">
        <Button
          label="New Listing"
          variant="primary"
          leftIcon={<Ionicons name="add" size={18} color={colors.white} />}
          onPress={() => navigation.navigate('ListingCreate', undefined)}
        />

        {dashboard.isLoading ? (
          <View className="flex-row gap-3">
            {[0, 1, 2, 3].map((i) => (
              <StatTileSkeleton key={i} />
            ))}
          </View>
        ) : dashboard.isError ? (
          <Text className="font-sans text-sm text-slate-gray">Couldn't load your stats.</Text>
        ) : dashboard.data ? (
          <View className="flex-row gap-3">
            <StatTile label="Listings" value={dashboard.data.totalListings} />
            <StatTile label="Pending" value={dashboard.data.byStatus.PENDING} />
            <StatTile label="Verified" value={dashboard.data.byStatus.VERIFIED} />
            <StatTile label="Leads" value={dashboard.data.totalLeads} />
          </View>
        ) : null}

        <View className="gap-3">
          <Text accessibilityRole="header" className="font-sans-semibold text-lg text-charcoal">
            Your listings
          </Text>
          {listings.isLoading ? (
            <View className="gap-2">
              {[0, 1, 2].map((i) => (
                <ListingRowSkeleton key={i} />
              ))}
            </View>
          ) : listings.isError ? (
            <Text className="font-sans text-sm text-slate-gray">Couldn't load your listings.</Text>
          ) : listings.data && listings.data.length > 0 ? (
            <View className="gap-2">
              {listings.data.map((listing) => (
                <Pressable
                  key={listing.id}
                  accessibilityRole="button"
                  onPress={() => navigation.navigate('ListingCreate', { propertyId: listing.id })}
                  className="flex-row items-center justify-between rounded-lg border border-mist bg-white p-3"
                  style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
                >
                  <View className="flex-1 gap-1 pr-3">
                    <Text numberOfLines={1} className="font-sans-semibold text-sm text-charcoal">
                      {listing.title || 'Untitled draft'}
                    </Text>
                    <Text className="font-sans text-xs text-slate-gray">
                      {listing.currency} {new Intl.NumberFormat('en-US').format(listing.price)}
                      {listing.purpose === 'RENT' ? '/mo' : ''}
                    </Text>
                  </View>
                  <View className={`rounded-full px-2.5 py-1 ${STATUS_CLASSNAMES[listing.status]}`}>
                    <Text className="font-sans-semibold text-xs">{STATUS_LABELS[listing.status]}</Text>
                  </View>
                </Pressable>
              ))}
            </View>
          ) : (
            <EmptyState
              icon="home-outline"
              title="No listings yet."
              message="Create your first listing to get started."
            />
          )}
        </View>

        <View className="gap-3">
          <Text accessibilityRole="header" className="font-sans-semibold text-lg text-charcoal">
            Recent leads
          </Text>
          {dashboard.data && dashboard.data.recentLeads.length > 0 ? (
            <View className="gap-2">
              {dashboard.data.recentLeads.map((lead) => (
                <View
                  key={lead.id}
                  className="flex-row items-center justify-between rounded-lg border border-mist bg-white p-3"
                >
                  <View className="flex-1 gap-1 pr-3">
                    <Text numberOfLines={1} className="font-sans-medium text-sm text-charcoal">
                      {lead.userName}
                    </Text>
                    <Text numberOfLines={1} className="font-sans text-xs text-slate-gray">
                      {lead.propertyTitle}
                    </Text>
                  </View>
                  <Text className="font-sans-semibold text-xs uppercase text-slate-gray">{lead.status}</Text>
                </View>
              ))}
            </View>
          ) : (
            <EmptyState icon="people-outline" title="No leads yet." />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
