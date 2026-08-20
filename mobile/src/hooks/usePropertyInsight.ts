import { useQuery } from '@tanstack/react-query';

import { fetchPropertyInsight } from '../api/ai';

export function usePropertyInsightQuery(propertyId: string | undefined) {
  return useQuery({
    queryKey: ['propertyInsight', propertyId],
    queryFn: () => fetchPropertyInsight(propertyId as string),
    enabled: Boolean(propertyId),
    // The score doesn't change between views once generated (server caches
    // it in AIInsight) — no need to refetch on remount/focus.
    staleTime: Infinity,
  });
}
