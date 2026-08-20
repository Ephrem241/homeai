import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

import { colors } from '../theme/tokens';

// "Verified" (property) and "Agent Verified" (identity) are intentionally
// distinct colors/icons — CLAUDE.md §4 guardrail: never implied interchangeable,
// never a legal/title verification.
export type VerificationStatus = 'verified' | 'agentVerified' | 'pending' | 'reported';

const STATUS_CONFIG: Record<
  VerificationStatus,
  { icon: keyof typeof Ionicons.glyphMap; label: string; className: string; textClassName: string; iconColor: string }
> = {
  verified: {
    icon: 'checkmark-circle',
    label: 'Verified',
    className: 'bg-success',
    textClassName: 'text-white',
    iconColor: colors.white,
  },
  agentVerified: {
    icon: 'shield-checkmark',
    label: 'Agent Verified',
    className: 'bg-gold',
    textClassName: 'text-charcoal',
    iconColor: colors.charcoal,
  },
  pending: {
    icon: 'time-outline',
    label: 'Pending',
    className: 'bg-mist',
    textClassName: 'text-slate-gray',
    iconColor: colors.slateGray,
  },
  reported: {
    icon: 'alert-circle',
    label: 'Reported',
    className: 'bg-error',
    textClassName: 'text-white',
    iconColor: colors.white,
  },
};

export default function VerificationBadge({
  status,
  label,
}: {
  status: VerificationStatus;
  label?: string;
}) {
  const config = STATUS_CONFIG[status];

  return (
    <View
      className={`flex-row items-center gap-1 self-start rounded-full px-2.5 py-1 ${config.className}`}
    >
      <Ionicons name={config.icon} size={12} color={config.iconColor} />
      <Text className={`font-sans-semibold text-xs ${config.textClassName}`}>
        {label ?? config.label}
      </Text>
    </View>
  );
}
