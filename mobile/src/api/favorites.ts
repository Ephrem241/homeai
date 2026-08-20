import { apiRequest } from './client';
import type { FavoriteItem } from './types';

export function fetchFavorites() {
  return apiRequest<FavoriteItem[]>('/favorites');
}

export function toggleFavorite(propertyId: string) {
  return apiRequest<{ saved: boolean }>('/favorites/toggle', {
    method: 'POST',
    body: JSON.stringify({ propertyId }),
  });
}
