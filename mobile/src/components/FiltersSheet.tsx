import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import type { PropertyPurpose, PropertyType } from '../api/types';
import { colors } from '../theme/tokens';
import BottomSheet from './BottomSheet';
import Button from './Button';
import FilterChip from './FilterChip';
import Input from './Input';
import SegmentedTabs from './SegmentedTabs';

export type FiltersValue = {
  purpose?: PropertyPurpose;
  type?: PropertyType;
  minPrice?: string;
  maxPrice?: string;
  bedrooms?: number;
  currency?: string;
  furnished?: boolean;
  parking?: boolean;
};

const TYPE_OPTIONS: { label: string; value: PropertyType; icon: keyof typeof Ionicons.glyphMap }[] = [
  { label: 'Apartment', value: 'APARTMENT', icon: 'business-outline' },
  { label: 'House', value: 'HOUSE', icon: 'home-outline' },
  { label: 'Land', value: 'LAND', icon: 'map-outline' },
  { label: 'Commercial', value: 'COMMERCIAL', icon: 'storefront-outline' },
];

const BEDROOM_OPTIONS = [
  { label: 'Any', value: 0 },
  { label: '1+', value: 1 },
  { label: '2+', value: 2 },
  { label: '3+', value: 3 },
  { label: '4+', value: 4 },
];

const CURRENCY_OPTIONS = ['ETB', 'USD', 'EUR'];

function FieldLabel({ children }: { children: string }) {
  return <Text className="font-sans-medium text-sm text-charcoal">{children}</Text>;
}

export default function FiltersSheet({
  visible,
  onClose,
  value,
  onApply,
  locationLabel,
  onPressLocation,
}: {
  visible: boolean;
  onClose: () => void;
  value: FiltersValue;
  onApply: (value: FiltersValue) => void;
  locationLabel?: string;
  onPressLocation: () => void;
}) {
  const [draft, setDraft] = useState<FiltersValue>(value);

  useEffect(() => {
    if (visible) setDraft(value);
  }, [visible, value]);

  return (
    <BottomSheet visible={visible} onClose={onClose} title="Filters">
      <ScrollView className="max-h-[520px]" contentContainerClassName="gap-6" showsVerticalScrollIndicator={false}>
        <View className="gap-2">
          <FieldLabel>Purpose</FieldLabel>
          <SegmentedTabs
            options={[
              { label: 'Any', value: 'any' },
              { label: 'Buy', value: 'BUY' },
              { label: 'Rent', value: 'RENT' },
            ]}
            value={draft.purpose ?? 'any'}
            onChange={(next) =>
              setDraft((d) => ({ ...d, purpose: next === 'any' ? undefined : (next as PropertyPurpose) }))
            }
          />
        </View>

        <View className="gap-2">
          <FieldLabel>Property type</FieldLabel>
          <View className="flex-row flex-wrap gap-2">
            {TYPE_OPTIONS.map((option) => (
              <FilterChip
                key={option.value}
                label={option.label}
                icon={option.icon}
                selected={draft.type === option.value}
                onPress={() =>
                  setDraft((d) => ({ ...d, type: d.type === option.value ? undefined : option.value }))
                }
              />
            ))}
          </View>
        </View>

        <View className="gap-2">
          <FieldLabel>Location</FieldLabel>
          <Pressable
            accessibilityRole="button"
            onPress={onPressLocation}
            className="flex-row items-center justify-between rounded-md border border-mist bg-white px-4 py-3.5"
          >
            <Text className={`font-sans text-base ${locationLabel ? 'text-charcoal' : 'text-slate-gray'}`}>
              {locationLabel ?? 'Any location'}
            </Text>
            <Ionicons name="chevron-forward" size={18} color={colors.slateGray} />
          </Pressable>
        </View>

        <View className="gap-2">
          <FieldLabel>Price range</FieldLabel>
          <View className="flex-row gap-3">
            <View className="flex-1">
              <Input
                placeholder="Min"
                keyboardType="numeric"
                value={draft.minPrice ?? ''}
                onChangeText={(text) => setDraft((d) => ({ ...d, minPrice: text }))}
              />
            </View>
            <View className="flex-1">
              <Input
                placeholder="Max"
                keyboardType="numeric"
                value={draft.maxPrice ?? ''}
                onChangeText={(text) => setDraft((d) => ({ ...d, maxPrice: text }))}
              />
            </View>
          </View>
          <View className="flex-row flex-wrap gap-2">
            {CURRENCY_OPTIONS.map((code) => (
              <FilterChip
                key={code}
                label={code}
                selected={draft.currency === code}
                onPress={() => setDraft((d) => ({ ...d, currency: d.currency === code ? undefined : code }))}
              />
            ))}
          </View>
        </View>

        <View className="gap-2">
          <FieldLabel>Bedrooms</FieldLabel>
          <View className="flex-row flex-wrap gap-2">
            {BEDROOM_OPTIONS.map((option) => (
              <FilterChip
                key={option.value}
                label={option.label}
                selected={(draft.bedrooms ?? 0) === option.value}
                onPress={() => setDraft((d) => ({ ...d, bedrooms: option.value || undefined }))}
              />
            ))}
          </View>
        </View>

        <View className="gap-2">
          <FieldLabel>Amenities</FieldLabel>
          <View className="flex-row flex-wrap gap-2">
            <FilterChip
              label="Furnished"
              selected={Boolean(draft.furnished)}
              onPress={() => setDraft((d) => ({ ...d, furnished: d.furnished ? undefined : true }))}
            />
            <FilterChip
              label="Parking"
              selected={Boolean(draft.parking)}
              onPress={() => setDraft((d) => ({ ...d, parking: d.parking ? undefined : true }))}
            />
          </View>
        </View>
      </ScrollView>

      <View className="flex-row gap-3 pt-5">
        <View className="flex-1">
          <Button
            label="Reset"
            variant="secondary"
            fullWidth
            onPress={() => {
              setDraft({});
              onApply({});
            }}
          />
        </View>
        <View className="flex-1">
          <Button label="Apply" variant="primary" fullWidth onPress={() => onApply(draft)} />
        </View>
      </View>
    </BottomSheet>
  );
}
