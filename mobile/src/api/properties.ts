import { apiRequest, buildQueryString } from './client';
import type {
  PopularLocation,
  PropertyDetail,
  PropertyFilters,
  PropertyListItem,
  PropertyListResponse,
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
