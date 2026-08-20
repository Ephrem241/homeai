import { apiRequest } from './client';
import type { ChatMessage, ListingCopy, ParsedSearchResult, PropertyInsight } from './types';

export function parseSearch(query: string) {
  return apiRequest<ParsedSearchResult>('/ai/parse-search', {
    method: 'POST',
    body: JSON.stringify({ query }),
  });
}

export function fetchPropertyInsight(propertyId: string) {
  return apiRequest<PropertyInsight>(`/ai/properties/${propertyId}/insight`);
}

export function sendChatMessage(propertyId: string, message: string, history: ChatMessage[]) {
  return apiRequest<{ reply: string }>(`/ai/properties/${propertyId}/chat`, {
    method: 'POST',
    body: JSON.stringify({ message, history }),
  });
}

export function generateListingCopy(propertyId: string) {
  return apiRequest<ListingCopy>(`/ai/properties/${propertyId}/listing-assistant`, { method: 'POST' });
}
