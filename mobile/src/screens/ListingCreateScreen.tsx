import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { Pressable, SafeAreaView, ScrollView, Text, View } from 'react-native';

import type { PropertyPurpose, PropertyType, UpdatePropertyInput } from '../api/types';
import { Button, FilterChip, HeaderBar, Input, LocationPickerSheet, SegmentedTabs, SkeletonBlock } from '../components';
import { useDemoAgent } from '../hooks/useAgent';
import {
  useCreateProperty,
  useGenerateListingCopy,
  usePublishProperty,
  useUpdateProperty,
} from '../hooks/useListingMutations';
import { usePropertyQuery } from '../hooks/useProperties';
import type { ProfileStackParamList } from '../navigation/types';
import { colors } from '../theme/tokens';

const STEP_TITLES = [
  'Type & purpose',
  'Location',
  'Bedrooms & bathrooms',
  'Area',
  'Price',
  'Furnished & parking',
  'Amenities',
  'Photos',
  'AI listing assistant',
  'Review & publish',
];

const TYPE_OPTIONS: { label: string; value: PropertyType; icon: keyof typeof Ionicons.glyphMap }[] = [
  { label: 'Apartment', value: 'APARTMENT', icon: 'business-outline' },
  { label: 'House', value: 'HOUSE', icon: 'home-outline' },
  { label: 'Land', value: 'LAND', icon: 'map-outline' },
  { label: 'Commercial', value: 'COMMERCIAL', icon: 'storefront-outline' },
];

const AMENITY_OPTIONS = [
  'security',
  'generator',
  'elevator',
  'gym',
  'balcony',
  'garden',
  'water tank',
  'pool',
];

const CURRENCY_OPTIONS = ['ETB', 'USD', 'EUR'];

type WizardState = {
  type?: PropertyType;
  purpose?: PropertyPurpose;
  countryId?: string;
  cityId?: string;
  neighborhoodId?: string;
  locationLabel?: string;
  bedrooms: string;
  bathrooms: string;
  areaSqm: string;
  furnished: boolean;
  parking: boolean;
  price: string;
  currency: string;
  amenities: string[];
  photos: string[];
  photoUrlDraft: string;
  title: string;
  description: string;
  tags: string[];
};

const EMPTY_STATE: WizardState = {
  bedrooms: '',
  bathrooms: '',
  areaSqm: '',
  furnished: false,
  parking: false,
  price: '',
  currency: 'USD',
  amenities: [],
  photos: [],
  photoUrlDraft: '',
  title: '',
  description: '',
  tags: [],
};

function StepLabel({ children }: { children: string }) {
  return <Text className="font-sans-medium text-sm text-charcoal">{children}</Text>;
}

function buildPatchForStep(step: number, state: WizardState): UpdatePropertyInput {
  switch (step) {
    case 1:
      return { countryId: state.countryId, cityId: state.cityId, neighborhoodId: state.neighborhoodId };
    case 2:
      return {
        bedrooms: state.bedrooms ? Number(state.bedrooms) : undefined,
        bathrooms: state.bathrooms ? Number(state.bathrooms) : undefined,
      };
    case 3:
      return { areaSqm: state.areaSqm ? Number(state.areaSqm) : undefined };
    case 4:
      return { price: Number(state.price), currency: state.currency };
    case 5:
      return { furnished: state.furnished, parking: state.parking };
    case 6:
      return { amenities: state.amenities };
    case 7:
      return { photos: state.photos };
    default:
      return {};
  }
}

// Multi-step listing creation, per CLAUDE.md §5 Phase 5 — the Property row
// only exists once its required fields (type/purpose/location) are known
// (step 1), created with placeholder title/description/price, then each
// later step's "Next" persists that step's fields ("save as draft at each
// step"). The AI Listing Assistant step only ever rewrites facts already
// entered here — never invents anything (CLAUDE.md §4).
export default function ListingCreateScreen() {
  const route = useRoute<RouteProp<ProfileStackParamList, 'ListingCreate'>>();
  const navigation = useNavigation<NativeStackNavigationProp<ProfileStackParamList>>();
  const resumeId = route.params?.propertyId;

  const { data: agent } = useDemoAgent();
  const existing = usePropertyQuery(resumeId);
  const createMutation = useCreateProperty();
  const updateMutation = useUpdateProperty();
  const publishMutation = usePublishProperty();
  const generateMutation = useGenerateListingCopy();

  const [step, setStep] = useState(0);
  const [propertyId, setPropertyId] = useState<string | undefined>(resumeId);
  const [state, setState] = useState<WizardState>(EMPTY_STATE);
  const [locationPickerVisible, setLocationPickerVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [published, setPublished] = useState(false);

  useEffect(() => {
    if (!existing.data) return;
    setState({
      type: existing.data.type,
      purpose: existing.data.purpose,
      countryId: existing.data.countryId,
      cityId: existing.data.cityId,
      neighborhoodId: existing.data.neighborhoodId ?? undefined,
      locationLabel: existing.data.neighborhood ?? existing.data.city,
      bedrooms: existing.data.bedrooms ? String(existing.data.bedrooms) : '',
      bathrooms: existing.data.bathrooms ? String(existing.data.bathrooms) : '',
      areaSqm: existing.data.areaSqm ? String(existing.data.areaSqm) : '',
      furnished: existing.data.furnished,
      parking: existing.data.parking,
      price: existing.data.price ? String(existing.data.price) : '',
      currency: existing.data.currency,
      amenities: existing.data.amenities,
      photos: existing.data.photos,
      photoUrlDraft: '',
      title: existing.data.title,
      description: existing.data.description,
      tags: [],
    });
    setPublished(existing.data.status !== 'DRAFT');
  }, [existing.data]);

  if (resumeId && existing.isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-ivory">
        <HeaderBar title="Loading listing…" onBack={() => navigation.goBack()} />
        <View className="h-1 bg-mist" />
        <View className="gap-4 px-6 py-6">
          <SkeletonBlock className="h-6 w-1/2 rounded-sm" />
          <SkeletonBlock className="h-12 w-full rounded-md" />
          <SkeletonBlock className="h-12 w-full rounded-md" />
          <SkeletonBlock className="h-12 w-2/3 rounded-md" />
        </View>
      </SafeAreaView>
    );
  }

  function update<K extends keyof WizardState>(key: K, value: WizardState[K]) {
    setState((prev) => ({ ...prev, [key]: value }));
  }

  function validateStep(): string | null {
    if (step === 0 && (!state.type || !state.purpose)) {
      return 'Choose a property type and purpose to continue.';
    }
    if (step === 1 && !state.cityId) {
      return 'Choose a location to continue.';
    }
    if (step === 4 && (!state.price || Number(state.price) <= 0)) {
      return 'Enter a price to continue.';
    }
    return null;
  }

  function handleBack() {
    setError(null);
    if (step === 0) {
      navigation.goBack();
      return;
    }
    setStep((s) => s - 1);
  }

  async function handleNext() {
    const validationError = validateStep();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);

    try {
      if (step === 1 && !propertyId) {
        if (!agent) throw new Error('No agent available');
        const created = await createMutation.mutateAsync({
          agentId: agent.id,
          type: state.type as PropertyType,
          purpose: state.purpose as PropertyPurpose,
          countryId: state.countryId as string,
          cityId: state.cityId as string,
          neighborhoodId: state.neighborhoodId,
          currency: state.currency,
        });
        setPropertyId(created.id);
      } else if (propertyId && step >= 1 && step <= 7) {
        await updateMutation.mutateAsync({ id: propertyId, input: buildPatchForStep(step, state) });
      }
      setStep((s) => Math.min(s + 1, STEP_TITLES.length - 1));
    } catch {
      setError('Something went wrong saving this step. Please try again.');
    }
  }

  async function handleGenerate() {
    if (!propertyId) return;
    setError(null);
    try {
      const result = await generateMutation.mutateAsync(propertyId);
      if (result.available) {
        update('title', result.title ?? '');
        update('description', result.description ?? '');
        update('tags', result.tags ?? []);
      } else {
        setError("We couldn't generate a description right now — you can write one yourself below.");
      }
    } catch {
      setError("We couldn't generate a description right now — you can write one yourself below.");
    }
  }

  async function handlePublish() {
    if (!propertyId) return;
    setError(null);
    try {
      await updateMutation.mutateAsync({
        id: propertyId,
        input: { title: state.title, description: state.description },
      });
      await publishMutation.mutateAsync(propertyId);
      setPublished(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong publishing this listing.');
    }
  }

  function renderStep() {
    switch (step) {
      case 0:
        return (
          <View className="gap-5">
            <View className="gap-2">
              <StepLabel>Property type</StepLabel>
              <View className="flex-row flex-wrap gap-2">
                {TYPE_OPTIONS.map((option) => (
                  <FilterChip
                    key={option.value}
                    label={option.label}
                    icon={option.icon}
                    selected={state.type === option.value}
                    onPress={() => update('type', option.value)}
                  />
                ))}
              </View>
            </View>
            <View className="gap-2">
              <StepLabel>Purpose</StepLabel>
              <SegmentedTabs
                options={[
                  { label: 'Buy', value: 'BUY' },
                  { label: 'Rent', value: 'RENT' },
                ]}
                value={state.purpose ?? ''}
                onChange={(v) => update('purpose', v as PropertyPurpose)}
              />
            </View>
          </View>
        );
      case 1:
        return (
          <View className="gap-2">
            <StepLabel>Location</StepLabel>
            <Pressable
              accessibilityRole="button"
              onPress={() => setLocationPickerVisible(true)}
              className="flex-row items-center justify-between rounded-md border border-mist bg-white px-4 py-3.5"
            >
              <Text className={`font-sans text-base ${state.locationLabel ? 'text-charcoal' : 'text-slate-gray'}`}>
                {state.locationLabel ?? 'Choose a city or neighborhood'}
              </Text>
              <Ionicons name="chevron-forward" size={18} color={colors.slateGray} />
            </Pressable>
          </View>
        );
      case 2:
        return (
          <View className="gap-4">
            <Input
              label="Bedrooms"
              keyboardType="numeric"
              value={state.bedrooms}
              onChangeText={(t) => update('bedrooms', t)}
              placeholder="e.g. 2"
            />
            <Input
              label="Bathrooms"
              keyboardType="numeric"
              value={state.bathrooms}
              onChangeText={(t) => update('bathrooms', t)}
              placeholder="e.g. 1"
            />
          </View>
        );
      case 3:
        return (
          <Input
            label="Area (m²)"
            keyboardType="numeric"
            value={state.areaSqm}
            onChangeText={(t) => update('areaSqm', t)}
            placeholder="e.g. 85"
          />
        );
      case 4:
        return (
          <View className="gap-4">
            <Input
              label="Price"
              keyboardType="numeric"
              value={state.price}
              onChangeText={(t) => update('price', t)}
              placeholder="e.g. 45000"
            />
            <View className="gap-2">
              <StepLabel>Currency</StepLabel>
              <View className="flex-row flex-wrap gap-2">
                {CURRENCY_OPTIONS.map((code) => (
                  <FilterChip
                    key={code}
                    label={code}
                    selected={state.currency === code}
                    onPress={() => update('currency', code)}
                  />
                ))}
              </View>
            </View>
          </View>
        );
      case 5:
        return (
          <View className="flex-row flex-wrap gap-2">
            <FilterChip
              label="Furnished"
              selected={state.furnished}
              onPress={() => update('furnished', !state.furnished)}
            />
            <FilterChip label="Parking" selected={state.parking} onPress={() => update('parking', !state.parking)} />
          </View>
        );
      case 6:
        return (
          <View className="flex-row flex-wrap gap-2">
            {AMENITY_OPTIONS.map((amenity) => (
              <FilterChip
                key={amenity}
                label={amenity}
                selected={state.amenities.includes(amenity)}
                onPress={() =>
                  update(
                    'amenities',
                    state.amenities.includes(amenity)
                      ? state.amenities.filter((a) => a !== amenity)
                      : [...state.amenities, amenity],
                  )
                }
              />
            ))}
          </View>
        );
      case 7:
        return (
          <View className="gap-3">
            <Input
              label="Photo URL"
              placeholder="https://…"
              value={state.photoUrlDraft}
              onChangeText={(t) => update('photoUrlDraft', t)}
              helperText="Paste a link to a photo. Device upload arrives once a storage bucket is wired up."
            />
            <Button
              label="Add photo"
              variant="secondary"
              onPress={() => {
                const url = state.photoUrlDraft.trim();
                if (!url) return;
                update('photos', [...state.photos, url]);
                update('photoUrlDraft', '');
              }}
            />
            {state.photos.length > 0 ? (
              <View className="gap-2">
                {state.photos.map((url, index) => (
                  <View
                    key={`${url}-${index}`}
                    className="flex-row items-center justify-between rounded-md border border-mist bg-white px-3 py-2"
                  >
                    <Text numberOfLines={1} className="flex-1 font-sans text-xs text-slate-gray">
                      {url}
                    </Text>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel="Remove photo"
                      onPress={() => update('photos', state.photos.filter((_, i) => i !== index))}
                      hitSlop={8}
                    >
                      <Ionicons name="close" size={16} color={colors.slateGray} />
                    </Pressable>
                  </View>
                ))}
              </View>
            ) : null}
          </View>
        );
      case 8:
        return (
          <View className="gap-4">
            <Text className="font-sans text-sm text-slate-gray">
              Generate a title, description, and tags from what you've entered so far. Nothing is
              invented — review and edit everything before publishing.
            </Text>
            <Button
              label="Generate with AI"
              variant="primary"
              leftIcon={<Ionicons name="sparkles" size={16} color={colors.white} />}
              loading={generateMutation.isPending}
              onPress={handleGenerate}
            />
            {state.title || state.description ? (
              <View className="gap-3">
                <Input label="Title" value={state.title} onChangeText={(t) => update('title', t)} />
                <Input
                  label="Description"
                  value={state.description}
                  onChangeText={(t) => update('description', t)}
                  multiline
                  numberOfLines={5}
                />
                {state.tags.length > 0 ? (
                  <View className="flex-row flex-wrap gap-2">
                    {state.tags.map((tag) => (
                      <View key={tag} className="rounded-full bg-mist px-3 py-1.5">
                        <Text className="font-sans-medium text-xs text-charcoal">{tag}</Text>
                      </View>
                    ))}
                  </View>
                ) : null}
              </View>
            ) : null}
          </View>
        );
      case 9:
        return (
          <View className="gap-4">
            <View className="gap-1 rounded-lg border border-mist bg-white p-4">
              <Text className="font-sans-semibold text-lg text-charcoal">
                {state.title || 'Untitled listing'}
              </Text>
              <Text className="font-sans text-sm text-slate-gray">{state.locationLabel}</Text>
              <Text className="font-sans-bold text-base text-navy">
                {state.currency} {state.price || '0'}
                {state.purpose === 'RENT' ? '/mo' : ''}
              </Text>
              <Text className="pt-2 font-sans text-sm leading-5 text-charcoal">{state.description}</Text>
            </View>
            {published ? (
              <View className="items-center gap-2 rounded-lg bg-mist p-4">
                <Ionicons name="checkmark-circle" size={28} color={colors.success} />
                <Text className="font-sans-semibold text-base text-charcoal">Submitted for verification</Text>
                <Text className="text-center font-sans text-sm text-slate-gray">
                  Your listing is now pending verification — it'll appear in your dashboard.
                </Text>
                <Button label="Back to dashboard" variant="secondary" onPress={() => navigation.navigate('AgentDashboard')} />
              </View>
            ) : (
              <Button
                label="Publish listing"
                variant="primary"
                fullWidth
                loading={publishMutation.isPending}
                onPress={handlePublish}
              />
            )}
          </View>
        );
      default:
        return null;
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-ivory">
      <HeaderBar title={`Step ${step + 1} of ${STEP_TITLES.length}`} onBack={handleBack} />

      <View className="h-1 bg-mist">
        <View className="h-1 bg-navy" style={{ width: `${((step + 1) / STEP_TITLES.length) * 100}%` }} />
      </View>

      <ScrollView contentContainerClassName="gap-3 px-6 py-6" keyboardShouldPersistTaps="handled">
        <Text className="font-sans-bold text-xl text-charcoal">{STEP_TITLES[step]}</Text>
        {renderStep()}
        {error ? <Text className="font-sans text-sm text-error">{error}</Text> : null}
      </ScrollView>

      {step < STEP_TITLES.length - 1 ? (
        <View className="border-t border-mist bg-white px-6 py-3">
          <Button
            label="Next"
            variant="primary"
            fullWidth
            loading={createMutation.isPending || updateMutation.isPending}
            onPress={handleNext}
          />
        </View>
      ) : null}

      <LocationPickerSheet
        visible={locationPickerVisible}
        onClose={() => setLocationPickerVisible(false)}
        onSelect={(location) => {
          setState((prev) => ({
            ...prev,
            countryId: location.countryId,
            cityId: location.cityId,
            neighborhoodId: location.neighborhoodId,
            locationLabel: location.name,
          }));
          setLocationPickerVisible(false);
        }}
      />
    </SafeAreaView>
  );
}
