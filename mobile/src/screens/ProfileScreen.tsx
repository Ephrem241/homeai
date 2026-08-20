import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView, ScrollView, Text, View } from 'react-native';

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
        <Text className="font-sans-bold text-3xl text-charcoal">Profile</Text>

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
      </ScrollView>
    </SafeAreaView>
  );
}
