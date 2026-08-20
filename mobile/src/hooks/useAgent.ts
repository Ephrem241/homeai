import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { createAgent, fetchAgentDashboard, fetchAgentListings, fetchMyAgent } from '../api/agents';
import { useAuth } from './useAuth';

export function useMyAgentQuery() {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ['myAgent'],
    queryFn: fetchMyAgent,
    enabled: isAuthenticated,
    staleTime: Infinity,
  });
}

// Onboarding — creates an Agent profile for the signed-in user (CLAUDE.md
// §5 Phase 5 agent tools, now reachable by any real account instead of a
// single shared demo persona).
export function useCreateAgent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { businessName: string; bio?: string }) => createAgent(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myAgent'] });
    },
  });
}

export function useAgentDashboardQuery(enabled: boolean) {
  return useQuery({ queryKey: ['agentDashboard'], queryFn: fetchAgentDashboard, enabled });
}

export function useAgentListingsQuery(enabled: boolean) {
  return useQuery({ queryKey: ['agentListings'], queryFn: fetchAgentListings, enabled });
}
