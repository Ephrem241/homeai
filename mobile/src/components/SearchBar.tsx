import { Ionicons } from '@expo/vector-icons';
import { Pressable, TextInput, View, type TextInputProps } from 'react-native';

import { colors } from '../theme/tokens';

type SearchBarProps = TextInputProps & {
  onFilterPress?: () => void;
  // Makes the search icon itself a submit button — a discoverable, always-
  // reliable alternative to onSubmitEditing, which react-native-web doesn't
  // fire on Enter (native iOS/Android handle the keyboard return key fine).
  onSearchPress?: () => void;
};

export default function SearchBar({ onFilterPress, onSearchPress, ...props }: SearchBarProps) {
  return (
    <View className="flex-row items-center gap-2 rounded-lg border border-mist bg-white px-4 py-3.5">
      {onSearchPress ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Search"
          onPress={onSearchPress}
          hitSlop={8}
          style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
        >
          <Ionicons name="search" size={20} color={colors.slateGray} />
        </Pressable>
      ) : (
        <Ionicons name="search" size={20} color={colors.slateGray} />
      )}
      <TextInput
        placeholderTextColor={colors.slateGray}
        className="flex-1 font-sans text-base text-charcoal"
        {...props}
      />
      {onFilterPress ? (
        <Pressable
          accessibilityRole="button"
          onPress={onFilterPress}
          hitSlop={8}
          style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
        >
          <Ionicons name="options-outline" size={20} color={colors.navy} />
        </Pressable>
      ) : null}
    </View>
  );
}
