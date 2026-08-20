import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';

import { sendChatMessage } from '../api/ai';
import type { ChatMessage } from '../api/types';

export function usePropertyChat(propertyId: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const mutation = useMutation({
    // `messages` here is the history *before* this turn — the new user
    // message is sent as the separate `message` param, not appended first.
    mutationFn: (message: string) => sendChatMessage(propertyId, message, messages),
  });

  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || mutation.isPending) return;

    setMessages((prev) => [...prev, { role: 'user', content: trimmed }]);
    try {
      const { reply } = await mutation.mutateAsync(trimmed);
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: "Sorry, I couldn't reach the assistant. Please try again." },
      ]);
    }
  }

  return { messages, sendMessage, isSending: mutation.isPending };
}
