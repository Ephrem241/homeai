import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  fetchAdminAgents,
  fetchAdminOverview,
  fetchAdminProperties,
  fetchAdminUsers,
  updatePropertyStatus,
  verifyAgent,
} from '../api/admin';
import type { PropertyStatus } from '../api/types';

export function useAdminOverviewQuery() {
  return useQuery({ queryKey: ['adminOverview'], queryFn: fetchAdminOverview });
}

export function useAdminUsersQuery() {
  return useQuery({ queryKey: ['adminUsers'], queryFn: fetchAdminUsers });
}

export function useAdminAgentsQuery() {
  return useQuery({ queryKey: ['adminAgents'], queryFn: fetchAdminAgents });
}

export function useVerifyAgentMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (agentId: string) => verifyAgent(agentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminAgents'] });
      queryClient.invalidateQueries({ queryKey: ['adminOverview'] });
    },
  });
}

export function useAdminPropertiesQuery(status?: PropertyStatus) {
  return useQuery({
    queryKey: ['adminProperties', status ?? 'ALL'],
    queryFn: () => fetchAdminProperties(status),
  });
}

export function useUpdatePropertyStatusMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ propertyId, status }: { propertyId: string; status: PropertyStatus }) =>
      updatePropertyStatus(propertyId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminProperties'] });
      queryClient.invalidateQueries({ queryKey: ['adminOverview'] });
    },
  });
}
