import { apiRequest, buildQueryString } from './client';
import type { MessageThread, SendMessageInput, ThreadMessage } from './types';

export function fetchThreads(userId: string) {
  return apiRequest<MessageThread[]>(`/messages/threads${buildQueryString({ userId })}`);
}

export function fetchThreadMessages(threadId: string) {
  return apiRequest<ThreadMessage[]>(`/messages/threads/${threadId}`);
}

export function sendMessage(input: SendMessageInput) {
  return apiRequest<ThreadMessage>('/messages', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}
