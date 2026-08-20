import { Injectable, Logger } from '@nestjs/common';
import Anthropic from '@anthropic-ai/sdk';
import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod';
import { z } from 'zod';

import { LocationsService } from '../locations/locations.service';

const SearchCriteriaSchema = z.object({
  type: z.enum(['APARTMENT', 'HOUSE', 'LAND', 'COMMERCIAL']).nullable(),
  purpose: z.enum(['BUY', 'RENT']).nullable(),
  bedrooms: z.number().int().min(0).nullable(),
  minPrice: z.number().min(0).nullable(),
  maxPrice: z.number().min(0).nullable(),
  currency: z.string().nullable(),
  furnished: z.boolean().nullable(),
  parking: z.boolean().nullable(),
  location: z
    .string()
    .nullable()
    .describe(
      'The exact city or neighborhood name mentioned in the query, e.g. "Bole". Null if no place is named.',
    ),
});

// Deliberately locale-agnostic (CLAUDE.md §4) — no assumed market, currency,
// or address format. "location" is resolved against the real Location table
// after this call, not guessed here.
const SYSTEM_PROMPT = `You extract structured real-estate search criteria from a short, free-text query typed into a property search app that serves any country or city.

Rules:
- Only set a field when the query states or clearly implies it. Leave everything else null — never guess or default a value that wasn't mentioned.
- "location" is whatever city or neighborhood name appears in the query, exactly as written (e.g. "Bole", "Addis Ababa", "Brooklyn"). Null if no place is named.
- "currency" is only set when a currency code, symbol, or word appears in the query (e.g. "ETB", "USD", "$", "birr", "dollars"). Never assume a default currency.
- "minPrice"/"maxPrice": "under X" or "below X" sets maxPrice only. "over X" or "above X" sets minPrice only. "between X and Y" sets both. A bare price with no qualifier sets maxPrice.
- "bedrooms" is the number of bedrooms mentioned (e.g. "2 bedroom" -> 2, "studio" -> 0).
- "furnished"/"parking" are true only when explicitly mentioned as present; leave null if not mentioned — never set false.`;

export type ParsedSearchResult = {
  understood: boolean;
  type?: 'APARTMENT' | 'HOUSE' | 'LAND' | 'COMMERCIAL';
  purpose?: 'BUY' | 'RENT';
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

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly client = new Anthropic();

  constructor(private readonly locationsService: LocationsService) {}

  async parseSearch(query: string): Promise<ParsedSearchResult> {
    let parsed: z.infer<typeof SearchCriteriaSchema> | null;
    try {
      const response = await this.client.messages.parse({
        model: 'claude-opus-5',
        max_tokens: 1024,
        output_config: { format: zodOutputFormat(SearchCriteriaSchema), effort: 'low' },
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: query }],
      });
      parsed = response.parsed_output;
    } catch (error) {
      // Never surfaces the raw error to the client (CLAUDE.md §4) — caller
      // falls back to plain-text search when `understood` is false.
      this.logger.error(`AI search parse failed: ${(error as Error).message}`);
      return { understood: false };
    }

    if (!parsed) {
      return { understood: false };
    }

    const result: ParsedSearchResult = {
      understood: true,
      type: parsed.type ?? undefined,
      purpose: parsed.purpose ?? undefined,
      bedrooms: parsed.bedrooms ?? undefined,
      minPrice: parsed.minPrice ?? undefined,
      maxPrice: parsed.maxPrice ?? undefined,
      currency: parsed.currency ?? undefined,
      furnished: parsed.furnished ?? undefined,
      parking: parsed.parking ?? undefined,
    };

    if (parsed.location) {
      const resolved = await this.resolveLocation(parsed.location);
      if (resolved) {
        if (resolved.type === 'country') result.countryId = resolved.id;
        else if (resolved.type === 'city') result.cityId = resolved.id;
        else result.neighborhoodId = resolved.id;
        result.locationLabel = resolved.name;
      } else {
        result.unresolvedLocation = parsed.location;
      }
    }

    return result;
  }

  private async resolveLocation(text: string) {
    const candidates = await this.locationsService.search(text, 5);
    if (candidates.length === 0) return null;
    const exact = candidates.find((c) => c.name.toLowerCase() === text.toLowerCase());
    return exact ?? candidates[0];
  }
}
