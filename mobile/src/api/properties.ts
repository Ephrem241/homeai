import { apiRequest, buildQueryString } from './client';
import type {
  CreatePropertyInput,
  PopularLocation,
  PropertyDetail,
  PropertyFilters,
  PropertyListItem,
  PropertyListResponse,
  UpdatePropertyInput,
} from './types';

export function fetchProperties(filters: PropertyFilters = {}) {
  const query = buildQueryString({
    type: filters.type,
    purpose: filters.purpose,
    countryId: filters.countryId,
    cityId: filters.cityId,
    neighborhoodId: filters.neighborhoodId,
    minPrice: filters.minPrice,
    maxPrice: filters.maxPrice,
    currency: filters.currency,
    bedrooms: filters.bedrooms,
    furnished: filters.furnished,
    parking: filters.parking,
    q: filters.q,
    page: filters.page,
    limit: filters.limit,
    sort: filters.sort,
  });
  return apiRequest<PropertyListResponse>(`/properties${query}`);
}

export function fetchProperty(id: string) {
  return apiRequest<PropertyDetail>(`/properties/${id}`);
}

export function fetchRecommendedProperties(limit = 10) {
  return apiRequest<PropertyListItem[]>(`/properties/recommended${buildQueryString({ limit })}`);
}

export function fetchPopularLocations(limit = 6) {
  return apiRequest<PopularLocation[]>(`/properties/popular-locations${buildQueryString({ limit })}`);
}

export function createProperty(input: CreatePropertyInput) {
  return apiRequest<PropertyDetail>('/properties', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function updateProperty(id: string, input: UpdatePropertyInput) {
  return apiRequest<PropertyDetail>(`/properties/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}

export function publishProperty(id: string) {
  return apiRequest<PropertyDetail>(`/properties/${id}/publish`, { method: 'POST' });
}

export function reportProperty(id: string) {
  return apiRequest<PropertyDetail>(`/properties/${id}/report`, { method: 'POST' });
}
