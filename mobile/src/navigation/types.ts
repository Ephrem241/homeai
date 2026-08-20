import type { PropertyPurpose, PropertyType } from '../api/types';

export type SearchResultsParams =
  | {
      purpose?: PropertyPurpose;
      type?: PropertyType;
      q?: string;
      countryId?: string;
      cityId?: string;
      neighborhoodId?: string;
      locationLabel?: string;
      bedrooms?: number;
      minPrice?: number;
      maxPrice?: number;
      currency?: string;
      furnished?: boolean;
      parking?: boolean;
      unresolvedLocation?: string;
    }
  | undefined;

export type PropertyDetailParams = { propertyId: string };
export type PropertyAssistantParams = { propertyId: string };
export type CompareParams = { propertyIds: string[] };

export type HomeStackParamList = {
  Home: undefined;
  ComponentDemo: undefined;
  PropertyDetail: PropertyDetailParams;
  PropertyAssistant: PropertyAssistantParams;
};

export type ExploreStackParamList = {
  Explore: SearchResultsParams;
  PropertyDetail: PropertyDetailParams;
  PropertyAssistant: PropertyAssistantParams;
  Compare: CompareParams;
};

export type SavedStackParamList = {
  Saved: undefined;
  PropertyDetail: PropertyDetailParams;
  PropertyAssistant: PropertyAssistantParams;
};

export type DesignDetailParams = { designId: string };

export type AIStackParamList = {
  AI: undefined;
  HomeDesigner: undefined;
  MyDesigns: undefined;
  DesignDetail: DesignDetailParams;
};

export type ListingCreateParams = { propertyId?: string } | undefined;

export type MessageThreadParams = {
  otherUserId: string;
  otherUserName: string;
  propertyId?: string;
  propertyTitle?: string;
};

export type ProfileStackParamList = {
  Profile: undefined;
  AgentDashboard: undefined;
  ListingCreate: ListingCreateParams;
  AdminDashboard: undefined;
  Pricing: undefined;
  Messages: undefined;
  MessageThread: MessageThreadParams;
};

export type RootTabParamList = {
  HomeTab: undefined;
  ExploreTab: { screen: 'Explore'; params: SearchResultsParams } | undefined;
  SavedTab: undefined;
  AITab: undefined;
  ProfileTab:
    | { screen: 'Pricing' }
    | { screen: 'MessageThread'; params: MessageThreadParams }
    | undefined;
};
