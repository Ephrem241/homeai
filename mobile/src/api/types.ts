export type PropertyType = 'APARTMENT' | 'HOUSE' | 'LAND' | 'COMMERCIAL';
export type PropertyPurpose = 'BUY' | 'RENT';
export type PropertyStatus = 'DRAFT' | 'PENDING' | 'VERIFIED' | 'REPORTED' | 'UNAVAILABLE';

export type PropertyListItem = {
  id: string;
  type: PropertyType;
  purpose: PropertyPurpose;
  title: string;
  price: number;
  currency: string;
  bedrooms: number | null;
  bathrooms: number | null;
  areaSqm: number | null;
  furnished: boolean;
  parking: boolean;
  city: string;
  neighborhood: string | null;
  country: string;
  lat: number | null;
  lng: number | null;
  photo: string | null;
  status: PropertyStatus;
  agentVerified: boolean;
  agentName: string | null;
  createdAt: string;
};

export type PropertyDetail = PropertyListItem & {
  description: string;
  amenities: string[];
  photos: string[];
  neighborhoodId: string | null;
  cityId: string;
  countryId: string;
  contact: { name: string; verified: boolean; type: 'agent' | 'owner' };
};

export type PropertyListResponse = {
  data: PropertyListItem[];
  total: number;
  page: number;
  limit: number;
};

export type PopularLocation = {
  id: string;
  name: string;
  propertyCount: number;
};

export type LocationNode = {
  id: string;
  name: string;
  type: string;
  parentId: string | null;
  countryCode: string | null;
  currency: string | null;
  phoneCode: string | null;
  lat: number | null;
  lng: number | null;
};

export type LocationSearchResult = {
  id: string;
  name: string;
  type: string;
  countryCode: string | null;
  currency: string | null;
  breadcrumb: string;
};

export type FavoriteItem = {
  id: string;
  type: PropertyType;
  purpose: PropertyPurpose;
  title: string;
  price: number;
  currency: string;
  bedrooms: number | null;
  bathrooms: number | null;
  areaSqm: number | null;
  city: string;
  neighborhood: string | null;
  photo: string | null;
  status: PropertyStatus;
  agentVerified: boolean;
  savedAt: string;
};

export type DemoUser = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  role: string;
};

export type PropertyFilters = {
  type?: PropertyType;
  purpose?: PropertyPurpose;
  countryId?: string;
  cityId?: string;
  neighborhoodId?: string;
  minPrice?: number;
  maxPrice?: number;
  currency?: string;
  bedrooms?: number;
  furnished?: boolean;
  parking?: boolean;
  q?: string;
  page?: number;
  limit?: number;
  sort?: 'newest' | 'price_asc' | 'price_desc';
};

export type ParsedSearchResult = {
  understood: boolean;
  type?: PropertyType;
  purpose?: PropertyPurpose;
  bedrooms?: number;
  minPrice?: number;
  maxPrice?: number;
  currency?: string;
  furnished?: boolean;
  parking?: boolean;
  countryId?: string;
  cityId?: string;
  neighborhoodId?: string;
  locationLabel?: string;
  unresolvedLocation?: string;
};

export type PropertyInsight = {
  available: boolean;
  score?: number;
  confidence?: number;
  breakdown?: {
    location: number;
    price: number;
    space: number;
    amenities: number;
    condition: number;
    investment: number;
  };
  highlights?: string[];
  investmentCategory?: 'STRONG' | 'MODERATE' | 'NEEDS_REVIEW';
  investmentSummary?: string;
  generatedAt?: string;
};

export type ChatMessage = { role: 'user' | 'assistant'; content: string };
