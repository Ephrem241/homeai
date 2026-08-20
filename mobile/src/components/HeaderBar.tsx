import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { ReactNode } from 'react';
import { Platform, Pressable, Text, View } from 'react-native';

import { colors } from '../theme/tokens';

// Android convention is a flat elevation shadow under the header; iOS uses a
// hairline border. CLAUDE.md §5 Phase 8 asks for this kind of platform-
// specific polish rather than one look stretched across both.
const platformHeaderStyle =
  Platform.OS === 'android'
    ? { elevation: 2, shadowColor: colors.charcoal }
    : { borderBottomWidth: 1, borderBottomColor: colors.mist };

// Consolidates the "back chevron + centered title + right slot" header
// repeated across every pushed screen — previously each copy was missing an
// accessibilityLabel on the back button, a screen-reader gap fixed once here.
export default function HeaderBar({
  title,
  subtitle,
  onBack,
  right,
}: {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  right?: ReactNode;
}) {
  const navigation = useNavigation();

  return (
    <View
      className="flex-row items-center justify-between bg-ivory px-6 py-4"
      style={platformHeaderStyle}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Go back"
        onPress={onBack ?? (() => navigation.goBack())}
        hitSlop={12}
        android_ripple={{ color: colors.mist, radius: 20, foreground: true }}
        className="h-9 w-9 items-center justify-center rounded-full"
      >
        <Ionicons name="chevron-back" size={22} color={colors.charcoal} />
      </Pressable>
      <View className="flex-1 items-center px-2">
        <Text accessibilityRole="header" numberOfLines={1} className="font-sans-semibold text-lg text-charcoal">
          {title}
        </Text>
        {subtitle ? (
          <Text numberOfLines={1} className="font-sans text-xs text-slate-gray">
            {subtitle}
          </Text>
        ) : null}
      </View>
      <View className="h-9 w-9 items-center justify-center">{right}</View>
    </View>
  );
}
