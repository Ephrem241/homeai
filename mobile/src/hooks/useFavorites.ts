import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';

import { fetchFavorites, toggleFavorite } from '../api/favorites';
import { useDemoUser } from './useDemoUser';

export function useFavoritesQuery() {
  const { data: user } = useDemoUser();
  const userId = user?.id;

  return useQuery({
    queryKey: ['favorites', userId],
    queryFn: () => fetchFavorites(userId as string),
    enabled: Boolean(userId),
  });
}

export function useFavoritedIds() {
  const { data } = useFavoritesQuery();
  return useMemo(() => new Set((data ?? []).map((item) => item.id)), [data]);
}

export function useToggleFavorite() {
  const { data: user } = useDemoUser();
  const queryClient = useQueryClient();
  const userId = user?.id;

  return useMutation({
    mutationFn: (propertyId: string) => {
      if (!userId) throw new Error('No current user yet');
      return toggleFavorite(userId, propertyId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites', userId] });
    },
  });
}
