import { useState } from 'react';
import { ScrollView, SafeAreaView, Text, View } from 'react-native';

import {
  AppModal,
  BottomSheet,
  Button,
  EmptyState,
  FilterChip,
  Input,
  LocationCard,
  LocationCardSkeleton,
  PriceBadge,
  PropertyCard,
  PropertyCardSkeleton,
  SearchBar,
  SegmentedTabs,
  VerificationBadge,
} from '../components';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View className="gap-3">
      <Text className="font-sans-semibold text-lg text-charcoal">{title}</Text>
      {children}
    </View>
  );
}

function SubLabel({ children }: { children: React.ReactNode }) {
  return <Text className="font-sans-medium text-xs uppercase text-slate-gray">{children}</Text>;
}

export default function ComponentDemoScreen() {
  const [searchValue, setSearchValue] = useState('');
  const [filterSelected, setFilterSelected] = useState(true);
  const [segment, setSegment] = useState('buy');
  const [sheetVisible, setSheetVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [inputValue, setInputValue] = useState('');

  return (
    <SafeAreaView className="flex-1 bg-ivory">
      <ScrollView className="flex-1 px-6" contentContainerClassName="gap-10 pb-16">
        <View className="gap-1 pt-4">
          <Text className="font-sans-bold text-3xl text-charcoal">Component library</Text>
          <Text className="font-sans text-base text-slate-gray">
            Every reusable component in its normal, empty, and loading-skeleton states.
          </Text>
        </View>

        <Section title="Buttons">
          <View className="gap-3">
            <Button label="Primary" variant="primary" onPress={() => {}} />
            <Button label="Secondary" variant="secondary" onPress={() => {}} />
            <Button label="Premium" variant="premium" onPress={() => {}} />
            <Button label="Disabled" variant="primary" disabled />
            <Button label="Loading" variant="primary" loading />
          </View>
        </Section>

        <Section title="Inputs">
          <View className="gap-4">
            <View className="gap-1.5">
              <SubLabel>Empty</SubLabel>
              <Input label="Full name" placeholder="e.g. Abebe Kebede" value="" onChangeText={() => {}} />
            </View>
            <View className="gap-1.5">
              <SubLabel>Filled</SubLabel>
              <Input
                label="Full name"
                placeholder="e.g. Abebe Kebede"
                value={inputValue || 'Abebe Kebede'}
                onChangeText={setInputValue}
              />
            </View>
            <View className="gap-1.5">
              <SubLabel>Error</SubLabel>
              <Input
                label="Phone number"
                placeholder="+251 9XX XXX XXX"
                value="0912"
                onChangeText={() => {}}
                error="Enter a valid international phone number."
              />
            </View>
          </View>
        </Section>

        <Section title="Search bar">
          <View className="gap-3">
            <View className="gap-1.5">
              <SubLabel>Empty</SubLabel>
              <SearchBar
                placeholder="Search city, neighborhood, or property"
                value=""
                onChangeText={() => {}}
                onFilterPress={() => {}}
              />
            </View>
            <View className="gap-1.5">
              <SubLabel>Filled</SubLabel>
              <SearchBar
                placeholder="Search city, neighborhood, or property"
                value={searchValue || '2 bedroom apartment in Bole'}
                onChangeText={setSearchValue}
                onFilterPress={() => {}}
              />
            </View>
          </View>
        </Section>

        <Section title="Verification badges">
          <View className="flex-row flex-wrap gap-3">
            <VerificationBadge status="verified" />
            <VerificationBadge status="agentVerified" />
            <VerificationBadge status="pending" />
            <VerificationBadge status="reported" />
          </View>
        </Section>

        <Section title="Price badge">
          <View className="flex-row flex-wrap gap-3">
            <PriceBadge price={60000} currency="ETB" period="mo" />
            <PriceBadge price={185000} currency="USD" />
          </View>
        </Section>

        <Section title="Filter chips">
          <View className="flex-row flex-wrap gap-2">
            <FilterChip
              label="Apartment"
              icon="business-outline"
              selected={filterSelected}
              onPress={() => setFilterSelected((v) => !v)}
            />
            <FilterChip label="House" icon="home-outline" />
            <FilterChip label="Land" icon="map-outline" />
            <FilterChip label="Commercial" icon="storefront-outline" />
          </View>
        </Section>

        <Section title="Segmented tabs">
          <SegmentedTabs
            options={[
              { label: 'Buy', value: 'buy' },
              { label: 'Rent', value: 'rent' },
            ]}
            value={segment}
            onChange={setSegment}
          />
        </Section>

        <Section title="Property card">
          <View className="gap-4">
            <View className="gap-1.5">
              <SubLabel>Normal</SubLabel>
              <PropertyCard
                title="Modern 2BR Apartment"
                location="Bole, Addis Ababa"
                price={60000}
                currency="ETB"
                period="mo"
                bedrooms={2}
                bathrooms={2}
                areaSqm={95}
                verificationStatus="verified"
              />
            </View>
            <View className="gap-1.5">
              <SubLabel>Loading skeleton</SubLabel>
              <PropertyCardSkeleton />
            </View>
          </View>
        </Section>

        <Section title="Location card">
          <View className="gap-1.5">
            <SubLabel>Normal + loading skeleton</SubLabel>
            <View className="flex-row gap-3">
              <LocationCard name="Bole" propertyCount={128} />
              <LocationCardSkeleton />
            </View>
          </View>
        </Section>

        <Section title="Empty states">
          <View className="gap-4 rounded-lg border border-mist bg-white">
            <EmptyState
              icon="heart-outline"
              title="Your next home starts here."
              actionLabel="Explore properties"
              onAction={() => {}}
            />
          </View>
          <View className="gap-4 rounded-lg border border-mist bg-white">
            <EmptyState
              icon="search-outline"
              title="We couldn't find an exact match."
              message="Try expanding your search or let AI find similar properties."
              actionLabel="Expand search"
              onAction={() => {}}
            />
          </View>
        </Section>

        <Section title="Bottom sheet & modal">
          <View className="flex-row gap-3">
            <Button label="Open bottom sheet" variant="secondary" onPress={() => setSheetVisible(true)} />
            <Button label="Open modal" variant="secondary" onPress={() => setModalVisible(true)} />
          </View>
        </Section>
      </ScrollView>

      <BottomSheet visible={sheetVisible} onClose={() => setSheetVisible(false)} title="Quick preview">
        <Text className="font-sans text-base text-slate-gray">
          Bottom sheets are used for quick property previews and filter panels.
        </Text>
        <View className="mt-4">
          <Button label="Close" variant="primary" onPress={() => setSheetVisible(false)} />
        </View>
      </BottomSheet>

      <AppModal visible={modalVisible} onClose={() => setModalVisible(false)} title="Discard changes?">
        <Text className="font-sans text-base text-slate-gray">
          This is a centered modal, used for confirmations and short-form dialogs.
        </Text>
        <View className="flex-row gap-3 pt-2">
          <View className="flex-1">
            <Button label="Cancel" variant="secondary" onPress={() => setModalVisible(false)} fullWidth />
          </View>
          <View className="flex-1">
            <Button label="Discard" variant="primary" onPress={() => setModalVisible(false)} fullWidth />
          </View>
        </View>
      </AppModal>
    </SafeAreaView>
  );
}
