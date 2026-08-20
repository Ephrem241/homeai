import { useMutation, useQueryClient } from '@tanstack/react-query';

import { generateListingCopy } from '../api/ai';
import { createProperty, publishProperty, updateProperty } from '../api/properties';
import type { CreatePropertyInput, UpdatePropertyInput } from '../api/types';

export function useCreateProperty() {
  return useMutation({ mutationFn: (input: CreatePropertyInput) => createProperty(input) });
}

export function useUpdateProperty() {
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdatePropertyInput }) => updateProperty(id, input),
  });
}

export function usePublishProperty() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => publishProperty(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agentDashboard'] });
      queryClient.invalidateQueries({ queryKey: ['agentListings'] });
    },
  });
}

export function useGenerateListingCopy() {
  return useMutation({ mutationFn: (propertyId: string) => generateListingCopy(propertyId) });
}
