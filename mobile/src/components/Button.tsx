import type { ReactNode } from 'react';
import { ActivityIndicator, Pressable, Text, type GestureResponderEvent } from 'react-native';

import { colors } from '../theme/tokens';

export type ButtonVariant = 'primary' | 'secondary' | 'premium';

type ButtonProps = {
  label: string;
  onPress?: (event: GestureResponderEvent) => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: ReactNode;
};

const VARIANT_CLASSNAMES: Record<ButtonVariant, string> = {
  primary: 'bg-navy',
  secondary: 'bg-white border border-navy',
  premium: 'bg-gold',
};

const VARIANT_TEXT_CLASSNAMES: Record<ButtonVariant, string> = {
  primary: 'text-white',
  secondary: 'text-navy',
  premium: 'text-charcoal',
};

const VARIANT_SPINNER_COLOR: Record<ButtonVariant, string> = {
  primary: colors.white,
  secondary: colors.navy,
  premium: colors.charcoal,
};

export default function Button({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  fullWidth = false,
  leftIcon,
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      onPress={isDisabled ? undefined : onPress}
      className={`flex-row items-center justify-center gap-2 rounded-md px-5 py-3.5 ${VARIANT_CLASSNAMES[variant]} ${fullWidth ? 'w-full' : ''}`}
      style={({ pressed }) => ({ opacity: isDisabled ? 0.4 : pressed ? 0.8 : 1 })}
    >
      {loading ? (
        <ActivityIndicator size="small" color={VARIANT_SPINNER_COLOR[variant]} />
      ) : (
        <>
          {leftIcon}
          <Text className={`font-sans-semibold text-base ${VARIANT_TEXT_CLASSNAMES[variant]}`}>
            {label}
          </Text>
        </>
      )}
    </Pressable>
  );
}
