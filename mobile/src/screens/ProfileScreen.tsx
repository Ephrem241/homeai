import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Pressable, SafeAreaView, ScrollView, Text, View } from 'react-native';

import { Button } from '../components';
import { useDemoAgent } from '../hooks/useAgent';
import { useDemoUser } from '../hooks/useDemoUser';
import type { ProfileStackParamList } from '../navigation/types';
import { colors } from '../theme/tokens';

// No role-switching UI yet (Phone OTP auth arrives in a later phase per
// CLAUDE.md §1) — this demo persona has both buyer and agent access so
// Phase 5's agent tools are reachable end to end.
export default function ProfileScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ProfileStackParamList>>();
  const { data: user } = useDemoUser();
  const { data: agent } = useDemoAgent();

  return (
    <SafeAreaView className="flex-1 bg-ivory">
      <ScrollView contentContainerClassName="gap-6 px-6 pb-10 pt-4">
        <Text accessibilityRole="header" className="font-sans-bold text-3xl text-charcoal">
          Profile
        </Text>

        <View className="gap-1 rounded-lg border border-mist bg-white p-4">
          <Text className="font-sans-medium text-xs uppercase text-slate-gray">Signed in as</Text>
          <Text className="font-sans-semibold text-lg text-charcoal">{user?.name ?? '—'}</Text>
          <Text className="font-sans text-sm text-slate-gray">{user?.phone ?? ''}</Text>
        </View>

        {agent ? (
          <View className="gap-3 rounded-lg border border-mist bg-white p-4">
            <View className="flex-row items-center gap-2">
              <Ionicons name="briefcase-outline" size={18} color={colors.navy} />
              <Text className="font-sans-semibold text-base text-charcoal">Agent tools</Text>
            </View>
            <Text className="font-sans text-sm text-slate-gray">
              Manage listings for {agent.businessName}.
            </Text>
            <Button
              label="Open Agent Dashboard"
              variant="primary"
              onPress={() => navigation.navigate('AgentDashboard')}
            />
          </View>
        ) : null}

        <View className="gap-3 rounded-lg border border-mist bg-white p-4">
          <View className="flex-row items-center gap-2">
            <Ionicons name="star-outline" size={18} color={colors.gold} />
            <Text className="font-sans-semibold text-base text-charcoal">Plan</Text>
          </View>
          <Text className="font-sans text-sm text-slate-gray">
            Current plan: {user?.subscriptionTier ?? '—'}
          </Text>
          <Button label="View plans" variant="secondary" onPress={() => navigation.navigate('Pricing')} />
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={() => navigation.navigate('Messages')}
          className="flex-row items-center justify-between rounded-lg border border-mist bg-white p-4"
          style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
        >
          <View className="flex-row items-center gap-2">
            <Ionicons name="chatbubbles-outline" size={18} color={colors.navy} />
            <Text className="font-sans-semibold text-base text-charcoal">Messages</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.slateGray} />
        </Pressable>

        {/* No auth-gated role switching yet (CLAUDE.md §1) — always reachable so
            the admin tools built in Phase 7 can be exercised against the real
            backend, same as Agent Dashboard above. */}
        <Pressable
          accessibilityRole="button"
          onPress={() => navigation.navigate('AdminDashboard')}
          className="flex-row items-center justify-between rounded-lg border border-mist bg-white p-4"
          style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
        >
          <View className="flex-row items-center gap-2">
            <Ionicons name="shield-outline" size={18} color={colors.navy} />
            <Text className="font-sans-semibold text-base text-charcoal">Admin Dashboard</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.slateGray} />
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
