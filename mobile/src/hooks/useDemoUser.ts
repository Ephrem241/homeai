import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { fetchDemoUser, updateUserTier } from '../api/favorites';
import type { SubscriptionTier } from '../api/types';

// Stands in for a signed-in user until Phone OTP auth ships (CLAUDE.md §1).
// Backed by GET /users/demo on the backend.
export function useDemoUser() {
  return useQuery({ queryKey: ['demoUser'], queryFn: fetchDemoUser, staleTime: Infinity });
}

// Stands in for a real payment provider (CLAUDE.md §7 non-goal) — sets the
// tier immediately so Phase 7's gating can be exercised end to end.
export function useUpdateTier() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, tier }: { userId: string; tier: SubscriptionTier }) => updateUserTier(userId, tier),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['demoUser'] });
      queryClient.invalidateQueries({ queryKey: ['propertyInsight'] });
    },
  });
}
