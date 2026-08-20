import { apiRequest } from './client';
import type { AuthUser, SubscriptionTier } from './types';

export function updateMyTier(tier: SubscriptionTier) {
  return apiRequest<AuthUser>('/users/me/tier', {
    method: 'PATCH',
    body: JSON.stringify({ tier }),
  });
}
