import { apiRequest, buildQueryString } from './client';
import type { LocationNode, LocationSearchResult } from './types';

export function fetchLocationChildren(parentId?: string) {
  return apiRequest<LocationNode[]>(`/locations${buildQueryString({ parentId })}`);
}

export function searchLocations(q: string) {
  return apiRequest<LocationSearchResult[]>(`/locations/search${buildQueryString({ q })}`);
}
