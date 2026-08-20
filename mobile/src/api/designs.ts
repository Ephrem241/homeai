import { apiRequest, buildQueryString } from './client';
import type { Design, GenerateDesignInput, GeneratedDesign, SaveDesignInput } from './types';

export function generateDesignPreview(input: GenerateDesignInput) {
  return apiRequest<GeneratedDesign>('/designs/generate', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function saveDesign(input: SaveDesignInput) {
  return apiRequest<Design>('/designs', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function fetchMyDesigns(userId: string) {
  return apiRequest<Design[]>(`/designs${buildQueryString({ userId })}`);
}

export function fetchDesign(id: string, userId: string) {
  return apiRequest<Design>(`/designs/${id}${buildQueryString({ userId })}`);
}

export function deleteDesign(id: string, userId: string) {
  return apiRequest<void>(`/designs/${id}${buildQueryString({ userId })}`, { method: 'DELETE' });
}
