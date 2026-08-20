import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ActivityIndicator, FlatList, Pressable, SafeAreaView, Text, View } from 'react-native';

import { EmptyState } from '../components';
import { useDemoUser } from '../hooks/useDemoUser';
import { useThreadsQuery } from '../hooks/useMessages';
import type { ProfileStackParamList } from '../navigation/types';
import { colors } from '../theme/tokens';

export default function MessagesScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ProfileStackParamList>>();
  const { data: user } = useDemoUser();
  const threads = useThreadsQuery(user?.id);

  return (
    <SafeAreaView className="flex-1 bg-ivory">
      <View className="flex-row items-center justify-between border-b border-mist px-6 py-4">
        <Pressable accessibilityRole="button" onPress={() => navigation.goBack()} hitSlop={8}>
          <Ionicons name="chevron-back" size={22} color={colors.charcoal} />
        </Pressable>
        <Text className="font-sans-semibold text-lg text-charcoal">Messages</Text>
        <View style={{ width: 22 }} />
      </View>

      {threads.isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={colors.navy} />
        </View>
      ) : (
        <FlatList
          data={threads.data ?? []}
          keyExtractor={(item) => item.threadId}
          contentContainerClassName="gap-2 px-6 py-4"
          ListEmptyComponent={
            <EmptyState
              icon="chatbubbles-outline"
              title="No conversations yet."
              message="Messages with agents and owners will appear here."
            />
          }
          renderItem={({ item }) => (
            <Pressable
              accessibilityRole="button"
              onPress={() =>
                navigation.navigate('MessageThread', {
                  otherUserId: item.otherUser.id,
                  otherUserName: item.otherUser.name,
                  propertyTitle: item.propertyTitle ?? undefined,
                })
              }
              className="gap-1 rounded-lg border border-mist bg-white p-4"
              style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
            >
              <View className="flex-row items-center justify-between">
                <Text className="font-sans-semibold text-base text-charcoal">{item.otherUser.name}</Text>
                <Text className="font-sans text-xs text-slate-gray">
                  {new Date(item.lastMessage.createdAt).toLocaleDateString()}
                </Text>
              </View>
              {item.propertyTitle ? (
                <Text numberOfLines={1} className="font-sans-medium text-xs text-slate-gray">
                  {item.propertyTitle}
                </Text>
              ) : null}
              <Text numberOfLines={1} className="font-sans text-sm text-slate-gray">
                {item.lastMessage.senderId === user?.id ? 'You: ' : ''}
                {item.lastMessage.body}
              </Text>
            </Pressable>
          )}
        />
      )}
    </SafeAreaView>
  );
}
