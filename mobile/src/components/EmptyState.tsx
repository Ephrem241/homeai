import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

import { colors } from '../theme/tokens';
import Button from './Button';

// Copy should follow the reusable patterns in CLAUDE.md §6 (e.g. "Your next
// home starts here.", "We couldn't find an exact match.") rather than generic
// "No data" text.
export default function EmptyState({
  icon = 'home-outline',
  title,
  message,
  actionLabel,
  onAction,
}: {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <View className="items-center gap-3 px-8 py-10">
      <View className="h-14 w-14 items-center justify-center rounded-full bg-mist">
        <Ionicons name={icon} size={24} color={colors.slateGray} />
      </View>
      <Text className="text-center font-sans-semibold text-base text-charcoal">{title}</Text>
      {message ? (
        <Text className="text-center font-sans text-sm text-slate-gray">{message}</Text>
      ) : null}
      {actionLabel && onAction ? (
        <Button label={actionLabel} variant="secondary" onPress={onAction} />
      ) : null}
    </View>
  );
}
