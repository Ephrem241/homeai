import { apiRequest } from './client';
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

export function fetchMyDesigns() {
  return apiRequest<Design[]>('/designs');
}

export function fetchDesign(id: string) {
  return apiRequest<Design>(`/designs/${id}`);
}

export function deleteDesign(id: string) {
  return apiRequest<void>(`/designs/${id}`, { method: 'DELETE' });
}
