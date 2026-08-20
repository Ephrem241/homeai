import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';

import type { ParsedSearchResult } from '../api/types';
import BottomSheet from './BottomSheet';
import Button from './Button';
import FilterChip from './FilterChip';

export type AiSearchDraft = Omit<ParsedSearchResult, 'understood'>;

const TYPE_LABELS: Record<string, string> = {
  APARTMENT: 'Apartment',
  HOUSE: 'House',
  LAND: 'Land',
  COMMERCIAL: 'Commercial',
};

const PURPOSE_LABELS: Record<string, string> = { BUY: 'Buy', RENT: 'Rent' };

function formatPriceLabel(min?: number, max?: number, currency?: string) {
  const amount = (n: number) => new Intl.NumberFormat('en-US').format(n);
  const cur = currency ? `${currency} ` : '';
  if (min !== undefined && max !== undefined) return `${cur}${amount(min)}–${amount(max)}`;
  if (max !== undefined) return `Under ${cur}${amount(max)}`;
  if (min !== undefined) return `Over ${cur}${amount(min)}`;
  return null;
}

// The "editable chips" review step from CLAUDE.md §5 Phase 3 — AI-parsed
// criteria are shown back to the user, each removable, before they're mapped
// onto the same filter/query logic Phase 2 built. Never treated as final
// until the user confirms.
export default function AiSearchReviewSheet({
  visible,
  onClose,
  query,
  result,
  onConfirm,
}: {
  visible: boolean;
  onClose: () => void;
  query: string;
  result: ParsedSearchResult | null;
  onConfirm: (draft: AiSearchDraft, fallbackToText: boolean) => void;
}) {
  const [draft, setDraft] = useState<AiSearchDraft>({});

  useEffect(() => {
    if (visible && result) {
      const { understood: _understood, ...rest } = result;
      setDraft(rest);
    }
  }, [visible, result]);

  const priceLabel = formatPriceLabel(draft.minPrice, draft.maxPrice, draft.currency);
  const bedroomsLabel =
    draft.bedrooms === undefined ? null : draft.bedrooms === 0 ? 'Studio' : `${draft.bedrooms}+ bed`;
  const hasAnyCriteria = Boolean(
    draft.type ||
      draft.purpose ||
      bedroomsLabel ||
      priceLabel ||
      draft.locationLabel ||
      draft.furnished ||
      draft.parking,
  );

  return (
    <BottomSheet visible={visible} onClose={onClose} title="We understood your search as">
      <View className="gap-4">
        {hasAnyCriteria ? (
          <View className="flex-row flex-wrap gap-2">
            {draft.type ? (
              <FilterChip
                label={TYPE_LABELS[draft.type]}
                selected
                onPress={() => setDraft((d) => ({ ...d, type: undefined }))}
              />
            ) : null}
            {draft.purpose ? (
              <FilterChip
                label={PURPOSE_LABELS[draft.purpose]}
                selected
                onPress={() => setDraft((d) => ({ ...d, purpose: undefined }))}
              />
            ) : null}
            {bedroomsLabel ? (
              <FilterChip
                label={bedroomsLabel}
                selected
                onPress={() => setDraft((d) => ({ ...d, bedrooms: undefined }))}
              />
            ) : null}
            {priceLabel ? (
              <FilterChip
                label={priceLabel}
                selected
                onPress={() =>
                  setDraft((d) => ({ ...d, minPrice: undefined, maxPrice: undefined, currency: undefined }))
                }
              />
            ) : null}
            {draft.furnished ? (
              <FilterChip
                label="Furnished"
                selected
                onPress={() => setDraft((d) => ({ ...d, furnished: undefined }))}
              />
            ) : null}
            {draft.parking ? (
              <FilterChip
                label="Parking"
                selected
                onPress={() => setDraft((d) => ({ ...d, parking: undefined }))}
              />
            ) : null}
            {draft.locationLabel ? (
              <FilterChip
                label={draft.locationLabel}
                icon="location-outline"
                selected
                onPress={() =>
                  setDraft((d) => ({
                    ...d,
                    countryId: undefined,
                    cityId: undefined,
                    neighborhoodId: undefined,
                    locationLabel: undefined,
                  }))
                }
              />
            ) : null}
          </View>
        ) : (
          <Text className="font-sans text-sm text-slate-gray">
            We couldn't pick out any specific details — we'll search for "{query}" instead.
          </Text>
        )}

        {draft.unresolvedLocation ? (
          <Text className="font-sans text-xs text-slate-gray">
            We couldn't match a location for "{draft.unresolvedLocation}" — showing results for
            everything else.
          </Text>
        ) : null}

        <Button label="Search" variant="primary" fullWidth onPress={() => onConfirm(draft, !hasAnyCriteria)} />
      </View>
    </BottomSheet>
  );
}
