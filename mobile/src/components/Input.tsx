import { useState } from 'react';
import { Text, TextInput, View, type TextInputProps } from 'react-native';

import { colors } from '../theme/tokens';

type InputProps = TextInputProps & {
  label?: string;
  error?: string;
  helperText?: string;
};

export default function Input({ label, error, helperText, editable = true, ...props }: InputProps) {
  const [focused, setFocused] = useState(false);

  const borderClassName = error
    ? 'border-error'
    : focused
      ? 'border-navy'
      : 'border-mist';

  return (
    <View className="gap-1.5">
      {label ? (
        <Text className="font-sans-medium text-sm text-charcoal">{label}</Text>
      ) : null}
      <TextInput
        editable={editable}
        onFocus={(event) => {
          setFocused(true);
          props.onFocus?.(event);
        }}
        onBlur={(event) => {
          setFocused(false);
          props.onBlur?.(event);
        }}
        placeholderTextColor={colors.slateGray}
        className={`rounded-md border bg-white px-4 py-3 font-sans text-base text-charcoal ${borderClassName} ${editable ? '' : 'bg-mist opacity-60'}`}
        {...props}
      />
      {error ? (
        <Text className="font-sans text-xs text-error">{error}</Text>
      ) : helperText ? (
        <Text className="font-sans text-xs text-slate-gray">{helperText}</Text>
      ) : null}
    </View>
  );
}
