import { useQuery } from '@tanstack/react-query';

import { fetchAgentDashboard, fetchAgentListings, fetchDemoAgent } from '../api/agents';

// Same "demo persona" stand-in as useDemoUser (CLAUDE.md §1 — real Phone OTP
// auth isn't built yet).
export function useDemoAgent() {
  return useQuery({ queryKey: ['demoAgent'], queryFn: fetchDemoAgent, staleTime: Infinity });
}

export function useAgentDashboardQuery(agentId: string | undefined) {
  return useQuery({
    queryKey: ['agentDashboard', agentId],
    queryFn: () => fetchAgentDashboard(agentId as string),
    enabled: Boolean(agentId),
  });
}

export function useAgentListingsQuery(agentId: string | undefined) {
  return useQuery({
    queryKey: ['agentListings', agentId],
    queryFn: () => fetchAgentListings(agentId as string),
    enabled: Boolean(agentId),
  });
}
