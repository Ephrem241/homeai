import { useMutation, useQueryClient } from '@tanstack/react-query';

import { updateMyTier } from '../api/users';
import type { SubscriptionTier } from '../api/types';
import { useAuth } from './useAuth';

// Stands in for a real payment provider (CLAUDE.md §7 non-goal) — sets the
// tier immediately so the gating built around it can be exercised end to
// end. Refreshes the cached AuthProvider user so every screen reading
// user.subscriptionTier sees the change immediately.
export function useUpdateTier() {
  const { refreshUser } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (tier: SubscriptionTier) => updateMyTier(tier),
    onSuccess: async () => {
      await refreshUser();
      queryClient.invalidateQueries({ queryKey: ['propertyInsight'] });
    },
  });
}
