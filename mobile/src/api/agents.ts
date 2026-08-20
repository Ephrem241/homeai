import { apiRequest } from './client';
import type { Agent, AgentDashboard, AgentListing } from './types';

export function fetchMyAgent() {
  return apiRequest<Agent | null>('/agents/me');
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
