import type { PropertiesService } from '../properties/properties.service';

export type PropertyDetail = Awaited<ReturnType<PropertiesService['findOne']>>;
export type Comparable = Awaited<ReturnType<PropertiesService['findComparables']>>[number];

// Shared grounding text for every property-scoped AI call (insight
// generation, chat) — the model only ever sees real listing data, never
// invents facts (CLAUDE.md §4).
export function formatPropertyBlock(property: PropertyDetail): string {
  return [
    `Type: ${property.type}, Purpose: ${property.purpose}`,
    `Title: ${property.title}`,
    `Price: ${property.price} ${property.currency}${property.purpose === 'RENT' ? ' per month' : ''}`,
    `Bedrooms: ${property.bedrooms ?? 'not specified'}, Bathrooms: ${property.bathrooms ?? 'not specified'}, Area: ${property.areaSqm ?? 'not specified'} sqm`,
    `Furnished: ${property.furnished ? 'yes' : 'no'}, Parking: ${property.parking ? 'yes' : 'no'}`,
    `Location: ${[property.neighborhood, property.city, property.country].filter(Boolean).join(', ')}`,
    `Amenities: ${property.amenities.length > 0 ? property.amenities.join(', ') : 'none listed'}`,
    `Description: "${property.description}"`,
    `Listed by: ${
      property.contact.type === 'agent'
        ? `agent (${property.contact.name}${property.contact.verified ? ', identity-verified' : ''})`
        : `owner (${property.contact.name})`
    }`,
  ].join('\n');
}

// Same structured facts as formatPropertyBlock but deliberately excludes
// title/description — during listing creation those are still empty
// placeholders (CLAUDE.md §5 Phase 5), not real agent-entered content the
// model should be grounded on.
export function formatListingFactsBlock(property: PropertyDetail): string {
  return [
    `Type: ${property.type}, Purpose: ${property.purpose}`,
    `Price: ${property.price} ${property.currency}${property.purpose === 'RENT' ? ' per month' : ''}`,
    `Bedrooms: ${property.bedrooms ?? 'not specified'}, Bathrooms: ${property.bathrooms ?? 'not specified'}, Area: ${property.areaSqm ?? 'not specified'} sqm`,
    `Furnished: ${property.furnished ? 'yes' : 'no'}, Parking: ${property.parking ? 'yes' : 'no'}`,
    `Location: ${[property.neighborhood, property.city, property.country].filter(Boolean).join(', ')}`,
    `Amenities: ${property.amenities.length > 0 ? property.amenities.join(', ') : 'none listed'}`,
  ].join('\n');
}

export function formatComparablesBlock(comparables: Comparable[]): string {
  if (comparables.length === 0) {
    return 'No comparable listings available in this city for the same type and purpose.';
  }
  return comparables
    .map(
      (c, i) =>
        `${i + 1}. "${c.title}" — ${c.price} ${c.currency}, ${c.areaSqm ?? 'unknown'} sqm, ${c.bedrooms ?? 'unknown'} bed, ${c.neighborhood ?? 'unknown area'}`,
    )
    .join('\n');
}
