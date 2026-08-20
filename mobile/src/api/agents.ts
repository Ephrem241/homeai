import { apiRequest } from './client';
import type { Agent, AgentDashboard, AgentListing } from './types';

export async function fetchMyAgent() {
  const { agent } = await apiRequest<{ agent: Agent | null }>('/agents/me');
  return agent;
}

export function createAgent(input: { businessName: string; bio?: string }) {
  return apiRequest<Agent>('/agents', { method: 'POST', body: JSON.stringify(input) });
}

export function fetchAgentDashboard() {
  return apiRequest<AgentDashboard>('/agents/me/dashboard');
}

export function fetchAgentListings() {
  return apiRequest<AgentListing[]>('/agents/me/listings');
}
