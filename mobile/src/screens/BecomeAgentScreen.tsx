import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useState } from 'react';
import { SafeAreaView, Text, View } from 'react-native';

import { ApiError } from '../api/client';
import { Button, HeaderBar, Input } from '../components';
import { useCreateAgent } from '../hooks/useAgent';
import type { ProfileStackParamList } from '../navigation/types';

// Onboarding entry point that used to not exist at all — every agent used
// to come from seed data or the shared demo persona (CLAUDE.md §5 Phase 5).
// Any real signed-in user can create an agent profile here.
export default function BecomeAgentScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ProfileStackParamList>>();
  const createAgent = useCreateAgent();

  const [businessName, setBusinessName] = useState('');
  const [bio, setBio] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (!businessName.trim()) {
      setError('Enter a business name to continue.');
      return;
    }
    setError(null);
    try {
      await createAgent.mutateAsync({ businessName: businessName.trim(), bio: bio.trim() || undefined });
      navigation.replace('AgentDashboard');
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Something went wrong. Please try again.');
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-ivory">
      <HeaderBar title="Become an agent" />
      <View className="gap-4 px-6 py-6">
        <Text className="font-sans text-sm text-slate-gray">
          Create an agent profile to list properties. An admin still verifies your account before your
          listings show the "Agent Verified" badge (CLAUDE.md §4).
        </Text>

        <Input
          label="Business name"
          placeholder="e.g. Habesha Homes Real Estate"
          value={businessName}
          onChangeText={setBusinessName}
        />
        <Input
          label="Bio (optional)"
          placeholder="A short line about your agency"
          value={bio}
          onChangeText={setBio}
          multiline
          numberOfLines={3}
        />

        {error ? <Text className="font-sans text-sm text-error">{error}</Text> : null}

        <Button label="Create agent profile" variant="primary" fullWidth loading={createAgent.isPending} onPress={handleSubmit} />
      </View>
    </SafeAreaView>
  );
}
