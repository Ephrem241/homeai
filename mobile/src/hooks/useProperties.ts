import { useQuery } from '@tanstack/react-query';

import {
  fetchPopularLocations,
  fetchProperties,
  fetchProperty,
  fetchRecommendedProperties,
} from '../api/properties';
import type { PropertyFilters } from '../api/types';

export function usePropertiesQuery(filters: PropertyFilters) {
  return useQuery({
    queryKey: ['properties', filters],
    queryFn: () => fetchProperties(filters),
  });
}

export function usePropertyQuery(id: string | undefined) {
  return useQuery({
    queryKey: ['property', id],
    queryFn: () => fetchProperty(id as string),
    enabled: Boolean(id),
  });
}

export function useRecommendedPropertiesQuery(limit = 10) {
  return useQuery({
    queryKey: ['properties', 'recommended', limit],
    queryFn: () => fetchRecommendedProperties(limit),
  });
}

export function usePopularLocationsQuery(limit = 6) {
  return useQuery({
    queryKey: ['properties', 'popular-locations', limit],
    queryFn: () => fetchPopularLocations(limit),
  });
}
