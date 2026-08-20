import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { fetchThreadMessages, fetchThreads, sendMessage } from '../api/messages';
import type { SendMessageInput } from '../api/types';

export function useThreadsQuery(userId: string | undefined) {
  return useQuery({
    queryKey: ['messageThreads', userId],
    queryFn: () => fetchThreads(userId as string),
    enabled: Boolean(userId),
  });
}

export function useThreadMessagesQuery(threadId: string | undefined) {
  return useQuery({
    queryKey: ['threadMessages', threadId],
    queryFn: () => fetchThreadMessages(threadId as string),
    enabled: Boolean(threadId),
    // Polling stands in for realtime delivery until a socket/push channel
    // exists — cheap enough for a two-person demo thread.
    refetchInterval: 5000,
  });
}

export function useSendMessageMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: SendMessageInput) => sendMessage(input),
    onSuccess: (message) => {
      queryClient.invalidateQueries({ queryKey: ['threadMessages', message.threadId] });
      queryClient.invalidateQueries({ queryKey: ['messageThreads'] });
    },
  });
}
