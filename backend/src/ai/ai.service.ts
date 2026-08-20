import { Injectable, Logger } from '@nestjs/common';
import Anthropic from '@anthropic-ai/sdk';
import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod';
import type { Prisma } from '@prisma/client';
import { z } from 'zod';

import { LocationsService } from '../locations/locations.service';
import { PrismaService } from '../prisma/prisma.service';
import { PropertiesService } from '../properties/properties.service';
import { formatComparablesBlock, formatListingFactsBlock, formatPropertyBlock } from './property-context';

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

const InsightSchema = z.object({
  score: z.number().min(0).max(100),
  confidence: z.number().min(0).max(1),
  breakdown: z.object({
    location: z.number().min(0).max(100),
    price: z.number().min(0).max(100),
    space: z.number().min(0).max(100),
    amenities: z.number().min(0).max(100),
    condition: z.number().min(0).max(100),
    investment: z.number().min(0).max(100),
  }),
  highlights: z.array(z.string()).min(1).max(4),
  investmentCategory: z.enum(['STRONG', 'MODERATE', 'NEEDS_REVIEW']),
  investmentSummary: z.string(),
});

// CLAUDE.md §4 — every score is a labeled estimate, never a guaranteed fact,
// legal verification, or financial/investment advice.
const INSIGHT_SYSTEM_PROMPT = `You produce an AI-generated property score for a real estate app. This is a heuristic estimate shown to browsing users — never a professional appraisal, legal verification, or guaranteed investment advice.

Score every dimension 0-100 based ONLY on the property data and comparable listings given below. Never invent facts not present in the data.

- location: how convenient/desirable the area seems, based only on the location name and any comparables nearby. No signal -> score 50.
- price: how the price compares to the given comparable listings (price per sqm where computable). No comparables -> score 50 and say so in investmentSummary.
- space: how the bedroom/bathroom count and area compare to the comparables and to what's typical for this property type.
- amenities: based on the number and desirability of the listed amenities.
- condition: infer ONLY from explicit language in the description (e.g. "newly renovated", "needs work"). No signal in the description -> score exactly 50, never guess.
- investment: overall value-for-money signal based on price vs. comparables.

confidence (0-1) must be lower when there are few or no comparables, or when the description is short or vague.

investmentCategory is STRONG, MODERATE, or NEEDS_REVIEW — based on the investment score and how much comparable data you had. Prefer NEEDS_REVIEW when confidence is low or comparables are absent.

investmentSummary: 1-2 plain-language sentences explaining the category. Must read as an estimate, never as guaranteed advice.

highlights: 2-4 short phrases (not full sentences) — the most notable positives or concerns.`;

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

function chatSystemPrompt(propertyBlock: string, contactLabel: string): string {
  return `You are a helpful assistant answering questions about ONE specific real estate listing inside a property search app. Answer ONLY using the property data below — never invent or assume facts that aren't stated (exact commute times, policies, negotiability, school quality, condition details not mentioned, etc.).

If the user asks something the data doesn't cover, say plainly that it isn't listed and suggest they contact the ${contactLabel} to ask directly. Never guess or fabricate an answer to fill a gap.

Keep answers short and conversational — 1-3 sentences unless the user asks for more detail. This is general information, not legal, financial, or professional real-estate advice.

Property data:
${propertyBlock}`;
}

const ListingCopySchema = z.object({
  title: z.string().min(10).max(80),
  description: z.string().min(40).max(600),
  tags: z.array(z.string().min(2).max(24)).min(3).max(8),
});

// CLAUDE.md §4 — "Listing Assistant only rewrites/organizes what the agent
// entered." No invented amenities, condition claims, or superlatives that
// aren't backed by a listed fact.
const LISTING_ASSISTANT_SYSTEM_PROMPT = `You write real estate listing copy for an agent-facing tool. Use ONLY the facts given below — never invent amenities, condition claims ("newly renovated", "spacious", "close to everything"), nearby attractions, or any detail not explicitly listed. If the facts are sparse, write a brief, honest description rather than padding it with invented detail.

title: a clear, factual listing title (type, bedrooms if relevant, neighborhood) — no superlatives that aren't backed by a listed fact.
description: 2-4 plain sentences organizing the given facts into readable copy.
tags: 3-8 short single/two-word tags drawn directly from the facts (e.g. type, neighborhood, amenities) — never invented tags.`;

export type ListingCopy = {
  available: boolean;
  title?: string;
  description?: string;
  tags?: string[];
};

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly client = new Anthropic();

  constructor(
    private readonly locationsService: LocationsService,
    private readonly propertiesService: PropertiesService,
    private readonly prisma: PrismaService,
  ) {}

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

  // Generated once per property, then cached in AIInsight — re-running the
  // model on every detail-screen view would be slow and needlessly costly.
  async getPropertyInsight(propertyId: string): Promise<PropertyInsight> {
    const existing = await this.prisma.aIInsight.findUnique({ where: { propertyId } });
    if (existing) {
      return this.toInsightResult(existing);
    }

    const property = await this.propertiesService.findOne(propertyId);
    const comparables = await this.propertiesService.findComparables({
      id: property.id,
      type: property.type,
      purpose: property.purpose,
      cityId: property.cityId,
    });

    const prompt = `${formatPropertyBlock(property)}\n\nComparable listings:\n${formatComparablesBlock(comparables)}`;

    let generated: z.infer<typeof InsightSchema> | null;
    try {
      const response = await this.client.messages.parse({
        model: 'claude-opus-5',
        max_tokens: 2048,
        output_config: { format: zodOutputFormat(InsightSchema), effort: 'medium' },
        system: INSIGHT_SYSTEM_PROMPT,
        messages: [{ role: 'user', content: prompt }],
      });
      generated = response.parsed_output;
    } catch (error) {
      this.logger.error(`Property insight generation failed: ${(error as Error).message}`);
      return { available: false };
    }

    if (!generated) {
      return { available: false };
    }

    const breakdown: Prisma.InputJsonObject = {
      location: generated.breakdown.location,
      price: generated.breakdown.price,
      space: generated.breakdown.space,
      amenities: generated.breakdown.amenities,
      condition: generated.breakdown.condition,
      investment: generated.breakdown.investment,
      highlights: generated.highlights,
      investmentCategory: generated.investmentCategory,
      investmentSummary: generated.investmentSummary,
    };

    const saved = await this.prisma.aIInsight.upsert({
      where: { propertyId },
      create: { propertyId, score: generated.score, confidence: generated.confidence, breakdown },
      update: { score: generated.score, confidence: generated.confidence, breakdown },
    });

    return this.toInsightResult(saved);
  }

  private toInsightResult(insight: {
    score: number;
    confidence: number;
    breakdown: Prisma.JsonValue;
    generatedAt: Date;
  }): PropertyInsight {
    const breakdown = insight.breakdown as Record<string, unknown>;
    return {
      available: true,
      score: insight.score,
      confidence: insight.confidence,
      breakdown: {
        location: breakdown.location as number,
        price: breakdown.price as number,
        space: breakdown.space as number,
        amenities: breakdown.amenities as number,
        condition: breakdown.condition as number,
        investment: breakdown.investment as number,
      },
      highlights: breakdown.highlights as string[],
      investmentCategory: breakdown.investmentCategory as PropertyInsight['investmentCategory'],
      investmentSummary: breakdown.investmentSummary as string,
      generatedAt: insight.generatedAt.toISOString(),
    };
  }

  async chatAboutProperty(propertyId: string, message: string, history: ChatMessage[]): Promise<{ reply: string }> {
    const property = await this.propertiesService.findOne(propertyId);
    const contactLabel = property.contact.type === 'agent' ? 'agent' : 'owner';
    const system = chatSystemPrompt(formatPropertyBlock(property), contactLabel);

    try {
      const response = await this.client.messages.create({
        model: 'claude-opus-5',
        max_tokens: 1024,
        system,
        messages: [...history, { role: 'user', content: message }],
      });
      const textBlock = response.content.find((block) => block.type === 'text');
      const reply = textBlock && 'text' in textBlock ? textBlock.text : '';
      return { reply: reply || "I couldn't come up with an answer — try asking in a different way." };
    } catch (error) {
      this.logger.error(`Property chat failed: ${(error as Error).message}`);
      return { reply: "Sorry, I'm having trouble answering right now. Please try again in a moment." };
    }
  }

  // Not cached — an agent iterating on a draft may regenerate several times
  // as they adjust facts, unlike the buyer-facing insight which is
  // view-only. The agent reviews and can freely edit before it's ever saved.
  async generateListingCopy(propertyId: string): Promise<ListingCopy> {
    const property = await this.propertiesService.findOne(propertyId);
    const prompt = formatListingFactsBlock(property);

    try {
      const response = await this.client.messages.parse({
        model: 'claude-opus-5',
        max_tokens: 1024,
        output_config: { format: zodOutputFormat(ListingCopySchema), effort: 'medium' },
        system: LISTING_ASSISTANT_SYSTEM_PROMPT,
        messages: [{ role: 'user', content: prompt }],
      });
      const parsed = response.parsed_output;
      if (!parsed) {
        return { available: false };
      }
      return { available: true, ...parsed };
    } catch (error) {
      this.logger.error(`Listing copy generation failed: ${(error as Error).message}`);
      return { available: false };
    }
  }
}
