import { useQuery } from '@tanstack/react-query';

import { fetchLocationChildren, searchLocations } from '../api/locations';

export function useLocationSearchQuery(q: string) {
  const trimmed = q.trim();
  return useQuery({
    queryKey: ['locations', 'search', trimmed],
    queryFn: () => searchLocations(trimmed),
    enabled: trimmed.length > 1,
  });
}

export function useLocationChildrenQuery(parentId?: string) {
  return useQuery({
    queryKey: ['locations', 'children', parentId ?? 'root'],
    queryFn: () => fetchLocationChildren(parentId),
  });
}
