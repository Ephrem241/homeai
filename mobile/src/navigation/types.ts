import type { PropertyPurpose, PropertyType } from '../api/types';

export type SearchResultsParams =
  | {
      purpose?: PropertyPurpose;
      type?: PropertyType;
      q?: string;
      cityId?: string;
      neighborhoodId?: string;
      locationLabel?: string;
    }
  | undefined;

export type PropertyDetailParams = { propertyId: string };

export type HomeStackParamList = {
  Home: undefined;
  ComponentDemo: undefined;
  PropertyDetail: PropertyDetailParams;
};

export type ExploreStackParamList = {
  Explore: SearchResultsParams;
  PropertyDetail: PropertyDetailParams;
};

export type SavedStackParamList = {
  Saved: undefined;
  PropertyDetail: PropertyDetailParams;
};

export type AIStackParamList = {
  AI: undefined;
};

export type ProfileStackParamList = {
  Profile: undefined;
};

export type RootTabParamList = {
  HomeTab: undefined;
  ExploreTab: { screen: 'Explore'; params: SearchResultsParams } | undefined;
  SavedTab: undefined;
  AITab: undefined;
  ProfileTab: undefined;
};
