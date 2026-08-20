import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, Pressable, SafeAreaView, Text, View } from 'react-native';

import { Input } from '../components';
import { useDemoUser } from '../hooks/useDemoUser';
import { useSendMessageMutation, useThreadMessagesQuery } from '../hooks/useMessages';
import type { ProfileStackParamList } from '../navigation/types';
import { colors } from '../theme/tokens';

// Deterministic pairing — matches buildThreadId on the backend
// (messages.service.ts) — so a thread with no messages yet still resolves.
function buildThreadId(userIdA: string, userIdB: string) {
  return [userIdA, userIdB].sort().join('_');
}

export default function MessageThreadScreen() {
  const route = useRoute<RouteProp<ProfileStackParamList, 'MessageThread'>>();
  const navigation = useNavigation<NativeStackNavigationProp<ProfileStackParamList>>();
  const { otherUserId, otherUserName, propertyId, propertyTitle } = route.params;

  const { data: user } = useDemoUser();
  const threadId = user ? buildThreadId(user.id, otherUserId) : undefined;
  const messages = useThreadMessagesQuery(threadId);
  const sendMessage = useSendMessageMutation();

  const [body, setBody] = useState('');

  function handleSend() {
    if (!user || !body.trim()) return;
    sendMessage.mutate({ senderId: user.id, recipientId: otherUserId, propertyId, body: body.trim() });
    setBody('');
  }

  return (
    <SafeAreaView className="flex-1 bg-ivory">
      <View className="flex-row items-center justify-between border-b border-mist px-6 py-4">
        <Pressable accessibilityRole="button" onPress={() => navigation.goBack()} hitSlop={8}>
          <Ionicons name="chevron-back" size={22} color={colors.charcoal} />
        </Pressable>
        <View className="items-center">
          <Text className="font-sans-semibold text-lg text-charcoal">{otherUserName}</Text>
          {propertyTitle ? (
            <Text numberOfLines={1} className="font-sans text-xs text-slate-gray">
              {propertyTitle}
            </Text>
          ) : null}
        </View>
        <View style={{ width: 22 }} />
      </View>

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={90}
      >
        <FlatList
          data={messages.data ?? []}
          keyExtractor={(item) => item.id}
          contentContainerClassName="gap-2 px-4 py-4"
          renderItem={({ item }) => {
            const isMine = item.senderId === user?.id;
            return (
              <View className={`max-w-[80%] rounded-lg px-4 py-2.5 ${isMine ? 'self-end bg-navy' : 'self-start border border-mist bg-white'}`}>
                <Text className={`font-sans text-sm ${isMine ? 'text-white' : 'text-charcoal'}`}>{item.body}</Text>
              </View>
            );
          }}
        />

        <View className="flex-row items-center gap-2 border-t border-mist px-4 py-3">
          <View className="flex-1">
            <Input placeholder="Write a message…" value={body} onChangeText={setBody} onSubmitEditing={handleSend} returnKeyType="send" />
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Send message"
            onPress={handleSend}
            disabled={!body.trim() || sendMessage.isPending}
            hitSlop={8}
            className="h-11 w-11 items-center justify-center rounded-full bg-navy"
            style={({ pressed }) => ({ opacity: !body.trim() || sendMessage.isPending ? 0.4 : pressed ? 0.7 : 1 })}
          >
            <Ionicons name="arrow-up" size={18} color={colors.white} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
