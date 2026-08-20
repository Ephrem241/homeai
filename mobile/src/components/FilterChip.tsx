import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text } from 'react-native';

import { colors } from '../theme/tokens';

export default function FilterChip({
  label,
  selected = false,
  onPress,
  icon,
}: {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      className={`flex-row items-center gap-1.5 self-start rounded-full border px-4 py-2 ${
        selected ? 'border-navy bg-navy' : 'border-mist bg-white'
      }`}
      style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
    >
      {icon ? (
        <Ionicons name={icon} size={14} color={selected ? colors.white : colors.slateGray} />
      ) : null}
      <Text
        className={`font-sans-medium text-sm ${selected ? 'text-white' : 'text-charcoal'}`}
      >
        {label}
      </Text>
    </Pressable>
  );
}
