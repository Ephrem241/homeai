import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { deleteDesign, fetchDesign, fetchMyDesigns, generateDesignPreview, saveDesign } from '../api/designs';
import type { GenerateDesignInput, SaveDesignInput } from '../api/types';

export function useMyDesignsQuery(userId: string | undefined) {
  return useQuery({
    queryKey: ['myDesigns', userId],
    queryFn: () => fetchMyDesigns(userId as string),
    enabled: Boolean(userId),
  });
}

export function useDesignQuery(id: string | undefined, userId: string | undefined) {
  return useQuery({
    queryKey: ['design', id, userId],
    queryFn: () => fetchDesign(id as string, userId as string),
    enabled: Boolean(id) && Boolean(userId),
  });
}

export function useGenerateDesign() {
  return useMutation({ mutationFn: (input: GenerateDesignInput) => generateDesignPreview(input) });
}

export function useSaveDesign() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: SaveDesignInput) => saveDesign(input),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['myDesigns', variables.userId] });
    },
  });
}

export function useDeleteDesign() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, userId }: { id: string; userId: string }) => deleteDesign(id, userId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['myDesigns', variables.userId] });
    },
  });
}
