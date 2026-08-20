import { apiRequest, buildQueryString } from './client';
import type { DemoUser, FavoriteItem } from './types';

export function fetchDemoUser() {
  return apiRequest<DemoUser>('/users/demo');
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
