import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';

import { fetchFavorites, toggleFavorite } from '../api/favorites';
import { useAuth } from './useAuth';

export function useFavoritesQuery() {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ['favorites'],
    queryFn: fetchFavorites,
    enabled: isAuthenticated,
  });
}

export function useFavoritedIds() {
  const { data } = useFavoritesQuery();
  return useMemo(() => new Set((data ?? []).map((item) => item.id)), [data]);
}

export function useToggleFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (propertyId: string) => toggleFavorite(propertyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
  });
}
