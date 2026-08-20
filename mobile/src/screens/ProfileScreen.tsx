import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Pressable, SafeAreaView, ScrollView, Text, View } from 'react-native';

import { Button } from '../components';
import { useMyAgentQuery } from '../hooks/useAgent';
import { useAuth } from '../hooks/useAuth';
import type { ProfileStackParamList } from '../navigation/types';
import { colors } from '../theme/tokens';

export default function ProfileScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ProfileStackParamList>>();
  const { user, logout } = useAuth();
  const { data: agent } = useMyAgentQuery();

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

        <View className="gap-3 rounded-lg border border-mist bg-white p-4">
          <View className="flex-row items-center gap-2">
            <Ionicons name="briefcase-outline" size={18} color={colors.navy} />
            <Text className="font-sans-semibold text-base text-charcoal">Agent tools</Text>
          </View>
          {agent ? (
            <>
              <Text className="font-sans text-sm text-slate-gray">Manage listings for {agent.businessName}.</Text>
              <Button
                label="Open Agent Dashboard"
                variant="primary"
                onPress={() => navigation.navigate('AgentDashboard')}
              />
            </>
          ) : (
            <>
              <Text className="font-sans text-sm text-slate-gray">List properties by creating an agent profile.</Text>
              <Button
                label="Become an agent"
                variant="secondary"
                onPress={() => navigation.navigate('BecomeAgent')}
              />
            </>
          )}
        </View>

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

        {user?.role === 'ADMIN' ? (
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
        ) : null}

        <Button label="Log out" variant="secondary" onPress={() => logout()} />
      </ScrollView>
    </SafeAreaView>
  );
}
