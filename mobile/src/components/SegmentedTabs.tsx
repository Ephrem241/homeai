import { Pressable, Text, View } from 'react-native';

export type SegmentedOption = { label: string; value: string };

export default function SegmentedTabs({
  options,
  value,
  onChange,
}: {
  options: SegmentedOption[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <View className="flex-row gap-1 rounded-md bg-mist p-1">
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            onPress={() => onChange(option.value)}
            className={`flex-1 items-center rounded-sm py-2 ${selected ? 'bg-white' : ''}`}
            style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
          >
            <Text
              className={`font-sans-semibold text-sm ${selected ? 'text-navy' : 'text-slate-gray'}`}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
