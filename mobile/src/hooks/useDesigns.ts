import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { deleteDesign, fetchDesign, fetchMyDesigns, generateDesignPreview, saveDesign } from '../api/designs';
import type { GenerateDesignInput, SaveDesignInput } from '../api/types';
import { useAuth } from './useAuth';

export function useMyDesignsQuery() {
  const { isAuthenticated } = useAuth();
  return useQuery({ queryKey: ['myDesigns'], queryFn: fetchMyDesigns, enabled: isAuthenticated });
}

export function useDesignQuery(id: string | undefined) {
  return useQuery({
    queryKey: ['design', id],
    queryFn: () => fetchDesign(id as string),
    enabled: Boolean(id),
  });
}

export function useGenerateDesign() {
  return useMutation({ mutationFn: (input: GenerateDesignInput) => generateDesignPreview(input) });
}

export function useSaveDesign() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: SaveDesignInput) => saveDesign(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myDesigns'] });
    },
  });
}

export function useDeleteDesign() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteDesign(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myDesigns'] });
    },
  });
}
