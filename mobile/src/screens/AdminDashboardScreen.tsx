import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useState } from 'react';
import { ActivityIndicator, Pressable, SafeAreaView, ScrollView, Text, View } from 'react-native';

import type { AdminAgent, AdminProperty, AdminUser } from '../api/types';
import { Button, EmptyState, FilterChip, VerificationBadge } from '../components';
import {
  useAdminAgentsQuery,
  useAdminOverviewQuery,
  useAdminPropertiesQuery,
  useAdminUsersQuery,
  useUpdatePropertyStatusMutation,
  useVerifyAgentMutation,
} from '../hooks/useAdmin';
import type { ProfileStackParamList } from '../navigation/types';
import { colors } from '../theme/tokens';

type Section = 'overview' | 'queue' | 'reports' | 'users' | 'agents';

const SECTIONS: { key: Section; label: string }[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'queue', label: 'Verification queue' },
  { key: 'reports', label: 'Reports' },
  { key: 'users', label: 'Users' },
  { key: 'agents', label: 'Agents' },
];

function StatTile({ label, value }: { label: string; value: number }) {
  return (
    <View className="min-w-[45%] flex-1 gap-1 rounded-lg border border-mist bg-white p-3">
      <Text className="font-sans-bold text-2xl text-charcoal">{value}</Text>
      <Text className="font-sans text-xs text-slate-gray">{label}</Text>
    </View>
  );
}

function PropertyRow({
  property,
  actions,
}: {
  property: AdminProperty;
  actions: { label: string; variant: 'primary' | 'secondary'; onPress: () => void }[];
}) {
  return (
    <View className="gap-2 rounded-lg border border-mist bg-white p-3">
      <Text numberOfLines={1} className="font-sans-semibold text-sm text-charcoal">
        {property.title}
      </Text>
      <Text className="font-sans text-xs text-slate-gray">
        {property.currency} {new Intl.NumberFormat('en-US').format(property.price)} · Listed by {property.listedBy}
      </Text>
      <View className="flex-row gap-2">
        {actions.map((action) => (
          <View key={action.label} className="flex-1">
            <Button label={action.label} variant={action.variant} fullWidth onPress={action.onPress} />
          </View>
        ))}
      </View>
    </View>
  );
}

// No auth-gated role switching yet (Phone OTP auth is a later phase per
// CLAUDE.md §1) — reachable from Profile for now so the verification queue
// built in Phase 7 can be exercised end to end against the real endpoints.
export default function AdminDashboardScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ProfileStackParamList>>();
  const [section, setSection] = useState<Section>('overview');

  const overview = useAdminOverviewQuery();
  const users = useAdminUsersQuery();
  const agents = useAdminAgentsQuery();
  const pending = useAdminPropertiesQuery('PENDING');
  const reported = useAdminPropertiesQuery('REPORTED');
  const updateStatus = useUpdatePropertyStatusMutation();
  const verifyAgentMutation = useVerifyAgentMutation();

  return (
    <SafeAreaView className="flex-1 bg-ivory">
      <View className="flex-row items-center justify-between border-b border-mist px-6 py-4">
        <Pressable accessibilityRole="button" onPress={() => navigation.goBack()} hitSlop={8}>
          <Ionicons name="chevron-back" size={22} color={colors.charcoal} />
        </Pressable>
        <Text className="font-sans-semibold text-lg text-charcoal">Admin Dashboard</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-2 px-6 py-4">
        {SECTIONS.map((option) => (
          <FilterChip
            key={option.key}
            label={option.label}
            selected={section === option.key}
            onPress={() => setSection(option.key)}
          />
        ))}
      </ScrollView>

      <ScrollView contentContainerClassName="gap-4 px-6 pb-10">
        {section === 'overview' ? (
          overview.isLoading || !overview.data ? (
            <ActivityIndicator color={colors.navy} />
          ) : (
            <>
              <View className="flex-row flex-wrap gap-3">
                <StatTile label="Users" value={overview.data.totalUsers} />
                <StatTile label="Agents" value={overview.data.totalAgents} />
                <StatTile label="Verified agents" value={overview.data.verifiedAgents} />
                <StatTile label="Properties" value={overview.data.totalProperties} />
                <StatTile label="Leads" value={overview.data.totalLeads} />
                <StatTile label="Messages" value={overview.data.totalMessages} />
              </View>
              <View className="gap-2 rounded-lg border border-mist bg-white p-4">
                <Text className="font-sans-semibold text-sm text-charcoal">Properties by status</Text>
                {Object.entries(overview.data.byStatus).map(([status, count]) => (
                  <View key={status} className="flex-row items-center justify-between">
                    <Text className="font-sans text-sm text-slate-gray">{status}</Text>
                    <Text className="font-sans-semibold text-sm text-charcoal">{count}</Text>
                  </View>
                ))}
              </View>
            </>
          )
        ) : null}

        {section === 'queue' ? (
          pending.isLoading ? (
            <ActivityIndicator color={colors.navy} />
          ) : pending.data && pending.data.length > 0 ? (
            pending.data.map((property) => (
              <PropertyRow
                key={property.id}
                property={property}
                actions={[
                  {
                    label: 'Verify',
                    variant: 'primary',
                    onPress: () => updateStatus.mutate({ propertyId: property.id, status: 'VERIFIED' }),
                  },
                  {
                    label: 'Decline',
                    variant: 'secondary',
                    onPress: () => updateStatus.mutate({ propertyId: property.id, status: 'UNAVAILABLE' }),
                  },
                ]}
              />
            ))
          ) : (
            <EmptyState icon="checkmark-done-outline" title="Nothing pending." message="New listings will appear here for review." />
          )
        ) : null}

        {section === 'reports' ? (
          reported.isLoading ? (
            <ActivityIndicator color={colors.navy} />
          ) : reported.data && reported.data.length > 0 ? (
            reported.data.map((property) => (
              <PropertyRow
                key={property.id}
                property={property}
                actions={[
                  {
                    label: 'Restore',
                    variant: 'primary',
                    onPress: () => updateStatus.mutate({ propertyId: property.id, status: 'VERIFIED' }),
                  },
                  {
                    label: 'Unlist',
                    variant: 'secondary',
                    onPress: () => updateStatus.mutate({ propertyId: property.id, status: 'UNAVAILABLE' }),
                  },
                ]}
              />
            ))
          ) : (
            <EmptyState icon="flag-outline" title="No reports." message="Listings flagged by users will appear here." />
          )
        ) : null}

        {section === 'users' ? (
          users.isLoading ? (
            <ActivityIndicator color={colors.navy} />
          ) : (
            (users.data ?? []).map((item: AdminUser) => (
              <View key={item.id} className="gap-1 rounded-lg border border-mist bg-white p-3">
                <View className="flex-row items-center justify-between">
                  <Text className="font-sans-semibold text-sm text-charcoal">{item.name}</Text>
                  <View className="rounded-full bg-mist px-2.5 py-1">
                    <Text className="font-sans-semibold text-xs text-slate-gray">{item.subscriptionTier}</Text>
                  </View>
                </View>
                <Text className="font-sans text-xs text-slate-gray">
                  {item.phone} · {item.role}
                </Text>
              </View>
            ))
          )
        ) : null}

        {section === 'agents' ? (
          agents.isLoading ? (
            <ActivityIndicator color={colors.navy} />
          ) : (
            (agents.data ?? []).map((agent: AdminAgent) => (
              <View key={agent.id} className="gap-2 rounded-lg border border-mist bg-white p-3">
                <View className="flex-row items-center justify-between">
                  <Text className="flex-1 font-sans-semibold text-sm text-charcoal">{agent.businessName}</Text>
                  {agent.verified ? <VerificationBadge status="agentVerified" /> : null}
                </View>
                <Text className="font-sans text-xs text-slate-gray">
                  {agent.userName} · {agent.listingCount} listing{agent.listingCount === 1 ? '' : 's'}
                </Text>
                {!agent.verified ? (
                  <Button
                    label="Verify agent"
                    variant="primary"
                    loading={verifyAgentMutation.isPending && verifyAgentMutation.variables === agent.id}
                    onPress={() => verifyAgentMutation.mutate(agent.id)}
                  />
                ) : null}
              </View>
            ))
          )
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
