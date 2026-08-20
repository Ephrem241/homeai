import { apiRequest, buildQueryString } from './client';
import type { DemoUser, FavoriteItem, SubscriptionTier } from './types';

export function fetchDemoUser() {
  return apiRequest<DemoUser>('/users/demo');
}

export function updateUserTier(userId: string, tier: SubscriptionTier) {
  return apiRequest<DemoUser>(`/users/${userId}/tier`, {
    method: 'PATCH',
    body: JSON.stringify({ tier }),
  });
}

export function fetchFavorites(userId: string) {
  return apiRequest<FavoriteItem[]>(`/favorites${buildQueryString({ userId })}`);
}

export function toggleFavorite(userId: string, propertyId: string) {
  return apiRequest<{ saved: boolean }>('/favorites/toggle', {
    method: 'POST',
    body: JSON.stringify({ userId, propertyId }),
  });
}
