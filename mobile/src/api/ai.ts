import { apiRequest } from './client';
import type { ParsedSearchResult } from './types';

export function parseSearch(query: string) {
  return apiRequest<ParsedSearchResult>('/ai/parse-search', {
    method: 'POST',
    body: JSON.stringify({ query }),
  });
}
