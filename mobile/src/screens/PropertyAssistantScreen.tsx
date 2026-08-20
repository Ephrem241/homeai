import { Ionicons } from '@expo/vector-icons';
import { useRoute, type RouteProp } from '@react-navigation/native';
import { useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  Text,
  TextInput,
  View,
} from 'react-native';

import type { ChatMessage } from '../api/types';
import { usePropertyChat } from '../hooks/usePropertyChat';
import type { ExploreStackParamList } from '../navigation/types';
import { colors } from '../theme/tokens';

const SUGGESTED_QUESTIONS = [
  "What's nearby this property?",
  'Is the price negotiable?',
  'Tell me more about the neighborhood',
  'What should I know before viewing?',
];

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user';
  return (
    <View className={`px-6 py-1.5 ${isUser ? 'items-end' : 'items-start'}`}>
      <View className={`max-w-[85%] rounded-lg px-4 py-3 ${isUser ? 'bg-navy' : 'bg-mist'}`}>
        <Text className={`font-sans text-base ${isUser ? 'text-white' : 'text-charcoal'}`}>
          {message.content}
        </Text>
      </View>
    </View>
  );
}

export default function PropertyAssistantScreen() {
  const route = useRoute<RouteProp<ExploreStackParamList, 'PropertyAssistant'>>();
  const { propertyId } = route.params;
  const { messages, sendMessage, isSending } = usePropertyChat(propertyId);
  const [input, setInput] = useState('');
  const listRef = useRef<FlatList<ChatMessage>>(null);

  function handleSend(text: string) {
    if (!text.trim() || isSending) return;
    setInput('');
    sendMessage(text);
    requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));
  }

  return (
    <SafeAreaView className="flex-1 bg-ivory">
      <View className="flex-row items-center gap-2 border-b border-mist px-6 py-4">
        <Ionicons name="sparkles" size={18} color={colors.navy} />
        <Text className="font-sans-semibold text-lg text-charcoal">Ask about this property</Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
        keyboardVerticalOffset={90}
      >
        {messages.length === 0 ? (
          <View className="flex-1 justify-end px-6 pb-4">
            <Text className="mb-3 font-sans text-sm text-slate-gray">
              Ask anything about this listing — answers are grounded in what the agent entered, not
              guesses.
            </Text>
            <View className="gap-2">
              {SUGGESTED_QUESTIONS.map((question) => (
                <Pressable
                  key={question}
                  accessibilityRole="button"
                  onPress={() => handleSend(question)}
                  className="rounded-md border border-mist bg-white px-4 py-3"
                  style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
                >
                  <Text className="font-sans text-sm text-charcoal">{question}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        ) : (
          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={(_, index) => String(index)}
            renderItem={({ item }) => <MessageBubble message={item} />}
            contentContainerStyle={{ paddingVertical: 12 }}
            onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
          />
        )}

        {isSending ? (
          <View className="flex-row items-center gap-2 px-6 pb-2">
            <ActivityIndicator size="small" color={colors.navy} />
            <Text className="font-sans text-xs text-slate-gray">Thinking…</Text>
          </View>
        ) : null}

        <View className="flex-row items-end gap-2 border-t border-mist bg-white px-4 py-3">
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Ask a question…"
            placeholderTextColor={colors.slateGray}
            className="max-h-24 flex-1 rounded-md border border-mist bg-ivory px-4 py-3 font-sans text-base text-charcoal"
            multiline
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Send"
            onPress={() => handleSend(input)}
            disabled={!input.trim() || isSending}
            className="h-11 w-11 items-center justify-center rounded-full bg-navy"
            style={{ opacity: !input.trim() || isSending ? 0.4 : 1 }}
          >
            <Ionicons name="arrow-up" size={20} color={colors.white} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
