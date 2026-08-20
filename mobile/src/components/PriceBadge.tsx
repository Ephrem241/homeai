import { Text, View } from 'react-native';

// Currency is always an explicit code on the badge (never a hardcoded symbol)
// so any market's listings read correctly — see CLAUDE.md §1/§4.
function formatAmount(price: number) {
  return new Intl.NumberFormat('en-US').format(price);
}

export default function PriceBadge({
  price,
  currency,
  period,
}: {
  price: number;
  currency: string;
  period?: string;
}) {
  return (
    <View className="flex-row items-baseline self-start rounded-full bg-navy px-3 py-1.5">
      <Text className="font-sans-bold text-sm text-white">
        {currency} {formatAmount(price)}
      </Text>
      {period ? <Text className="font-sans text-xs text-white/80">/{period}</Text> : null}
    </View>
  );
}
