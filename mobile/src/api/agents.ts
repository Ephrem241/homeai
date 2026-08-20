import { apiRequest } from './client';
import type { Agent, AgentDashboard, AgentListing } from './types';

export function fetchDemoAgent() {
  return apiRequest<Agent>('/agents/demo');
}

export function fetchAgentDashboard(agentId: string) {
  return apiRequest<AgentDashboard>(`/agents/${agentId}/dashboard`);
}

export function fetchAgentListings(agentId: string) {
  return apiRequest<AgentListing[]>(`/agents/${agentId}/listings`);
}
