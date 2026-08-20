import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { FlatList, Pressable, SafeAreaView, Text, View } from 'react-native';

import { EmptyState, HeaderBar, SkeletonBlock } from '../components';
import { useAuth } from '../hooks/useAuth';
import { useThreadsQuery } from '../hooks/useMessages';
import type { ProfileStackParamList } from '../navigation/types';

function ThreadRowSkeleton() {
  return (
    <View className="gap-2 rounded-lg border border-mist bg-white p-4">
      <SkeletonBlock className="h-4 w-2/5 rounded-sm" />
      <SkeletonBlock className="h-3 w-3/5 rounded-sm" />
    </View>
  );
}

export default function MessagesScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ProfileStackParamList>>();
  const { user } = useAuth();
  const threads = useThreadsQuery();

  return (
    <SafeAreaView className="flex-1 bg-ivory">
      <HeaderBar title="Messages" />

      {threads.isLoading ? (
        <View className="gap-2 px-6 py-4">
          {[0, 1, 2].map((i) => (
            <ThreadRowSkeleton key={i} />
          ))}
        </View>
      ) : threads.isError ? (
        <EmptyState
          icon="alert-circle-outline"
          title="Something went wrong."
          message="Please try again."
          actionLabel="Retry"
          onAction={() => threads.refetch()}
        />
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
