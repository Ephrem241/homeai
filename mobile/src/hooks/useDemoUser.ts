import { useQuery } from '@tanstack/react-query';

import { fetchDemoUser } from '../api/favorites';

// Stands in for a signed-in user until Phone OTP auth ships (CLAUDE.md §1).
// Backed by GET /users/demo on the backend.
export function useDemoUser() {
  return useQuery({ queryKey: ['demoUser'], queryFn: fetchDemoUser, staleTime: Infinity });
}
