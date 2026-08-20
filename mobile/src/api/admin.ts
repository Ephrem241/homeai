import { apiRequest, buildQueryString } from './client';
import type { AdminAgent, AdminOverview, AdminProperty, AdminUser, PropertyStatus } from './types';

export function fetchAdminOverview() {
  return apiRequest<AdminOverview>('/admin/overview');
}

export function fetchAdminUsers() {
  return apiRequest<AdminUser[]>('/admin/users');
}

export function fetchAdminAgents() {
  return apiRequest<AdminAgent[]>('/admin/agents');
}

// The verify/status-update endpoints return the raw updated row, not the
// joined admin list shape — callers invalidate the relevant list query
// instead of using this response body directly.
export function verifyAgent(agentId: string) {
  return apiRequest<unknown>(`/admin/agents/${agentId}/verify`, { method: 'PATCH' });
}

export function fetchAdminProperties(status?: PropertyStatus) {
  return apiRequest<AdminProperty[]>(`/admin/properties${buildQueryString({ status })}`);
}

export function updatePropertyStatus(propertyId: string, status: PropertyStatus) {
  return apiRequest<unknown>(`/admin/properties/${propertyId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}
