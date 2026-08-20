import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { QueryPropertiesDto } from './dto/query-properties.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';

const LIST_INCLUDE = {
  city: true,
  neighborhood: true,
  country: true,
  agent: { select: { businessName: true, verified: true } },
} satisfies Prisma.PropertyInclude;

const DETAIL_INCLUDE = {
  ...LIST_INCLUDE,
  agent: { select: { businessName: true, verified: true, userId: true } },
  ownerUser: { select: { id: true, name: true } },
} satisfies Prisma.PropertyInclude;

type PropertyWithRelations = Prisma.PropertyGetPayload<{ include: typeof LIST_INCLUDE }>;
type PropertyWithDetailRelations = Prisma.PropertyGetPayload<{ include: typeof DETAIL_INCLUDE }>;

@Injectable()
export class PropertiesService {
  constructor(private readonly prisma: PrismaService) {}

  private toListItem(property: PropertyWithRelations) {
    return {
      id: property.id,
      type: property.type,
      purpose: property.purpose,
      title: property.title,
      price: property.price.toNumber(),
      currency: property.currency,
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      areaSqm: property.areaSqm,
      furnished: property.furnished,
      parking: property.parking,
      city: property.city.name,
      neighborhood: property.neighborhood?.name ?? null,
      country: property.country.name,
      lat: property.lat,
      lng: property.lng,
      photo: property.photos[0] ?? null,
      status: property.status,
      agentVerified: property.agent?.verified ?? false,
      agentName: property.agent?.businessName ?? null,
      createdAt: property.createdAt,
    };
  }

  async findMany(query: QueryPropertiesDto) {
    const page = query.page ?? 1;
    const limit = Math.min(query.limit ?? 20, 50);

    const where: Prisma.PropertyWhereInput = {
      // Public marketplace browsing only ever surfaces VERIFIED listings —
      // draft/pending/reported properties stay in the agent/admin views
      // built in later phases (CLAUDE.md §5 Phase 5/7).
      status: 'VERIFIED',
      ...(query.type ? { type: query.type } : {}),
      ...(query.purpose ? { purpose: query.purpose } : {}),
      ...(query.countryId ? { countryId: query.countryId } : {}),
      ...(query.cityId ? { cityId: query.cityId } : {}),
      ...(query.neighborhoodId ? { neighborhoodId: query.neighborhoodId } : {}),
      ...(query.currency ? { currency: query.currency } : {}),
      ...(query.bedrooms !== undefined ? { bedrooms: { gte: query.bedrooms } } : {}),
      ...(query.furnished !== undefined ? { furnished: query.furnished } : {}),
      ...(query.parking !== undefined ? { parking: query.parking } : {}),
      ...(query.minPrice !== undefined || query.maxPrice !== undefined
        ? {
            price: {
              ...(query.minPrice !== undefined ? { gte: query.minPrice } : {}),
              ...(query.maxPrice !== undefined ? { lte: query.maxPrice } : {}),
            },
          }
        : {}),
      ...(query.q
        ? {
            OR: [
              { title: { contains: query.q, mode: 'insensitive' } },
              { description: { contains: query.q, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const orderBy: Prisma.PropertyOrderByWithRelationInput =
      query.sort === 'price_asc'
        ? { price: 'asc' }
        : query.sort === 'price_desc'
          ? { price: 'desc' }
          : { createdAt: 'desc' };

    const [total, properties] = await this.prisma.$transaction(
      [
        this.prisma.property.count({ where }),
        this.prisma.property.findMany({
          where,
          include: LIST_INCLUDE,
          orderBy,
          skip: (page - 1) * limit,
          take: limit,
        }),
      ],
      // A busy pooled connection (Supabase session pooler, small pool) can
      // occasionally take longer than Prisma's 5s default to free up — this
      // is a plain read, so waiting a bit longer beats failing the request.
      { maxWait: 10000, timeout: 15000 },
    );

    return {
      data: properties.map((property) => this.toListItem(property)),
      total,
      page,
      limit,
    };
  }

  async findRecommended(limit = 10) {
    // Recency-based for now — deliberately not AI-scored. Phase 2 is
    // "no AI yet" per CLAUDE.md §5; a smarter ranking arrives with the
    // AI Property Score in Phase 4.
    const properties = await this.prisma.property.findMany({
      where: { status: 'VERIFIED' },
      include: LIST_INCLUDE,
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
    return properties.map((property) => this.toListItem(property));
  }

  async findPopularLocations(limit = 6) {
    const grouped = await this.prisma.property.groupBy({
      by: ['neighborhoodId'],
      where: { status: 'VERIFIED', neighborhoodId: { not: null } },
      _count: { _all: true },
      orderBy: { _count: { neighborhoodId: 'desc' } },
      take: limit,
    });

    const ids = grouped.map((g) => g.neighborhoodId).filter((id): id is string => id !== null);
    const locations = await this.prisma.location.findMany({ where: { id: { in: ids } } });
    const byId = new Map(locations.map((location) => [location.id, location]));

    return grouped
      .filter((g) => g.neighborhoodId && byId.has(g.neighborhoodId))
      .map((g) => ({
        id: g.neighborhoodId as string,
        name: byId.get(g.neighborhoodId as string)!.name,
        propertyCount: g._count._all,
      }));
  }

  private toDetailItem(property: PropertyWithDetailRelations) {
    return {
      ...this.toListItem(property),
      description: property.description,
      amenities: property.amenities,
      photos: property.photos,
      neighborhoodId: property.neighborhoodId,
      cityId: property.cityId,
      countryId: property.countryId,
      contact: property.agent
        ? {
            userId: property.agent.userId,
            name: property.agent.businessName,
            verified: property.agent.verified,
            type: 'agent' as const,
          }
        : {
            userId: property.ownerUser?.id ?? null,
            name: property.ownerUser?.name ?? 'Owner',
            verified: false,
            type: 'owner' as const,
          },
    };
  }

  async findOne(id: string) {
    const property = await this.prisma.property.findUnique({ where: { id }, include: DETAIL_INCLUDE });
    if (!property) {
      throw new NotFoundException('Property not found');
    }
    return this.toDetailItem(property);
  }

  // Creates the row as soon as the minimum the schema requires is known
  // (type/purpose/location) — title/description/price start as placeholders
  // and get filled in by update() as the agent moves through the listing
  // wizard's remaining steps (CLAUDE.md §5 Phase 5 "save as draft at each
  // step"). Never publicly visible: status starts DRAFT.
  async create(dto: CreatePropertyDto) {
    const property = await this.prisma.property.create({
      data: {
        agentId: dto.agentId,
        type: dto.type,
        purpose: dto.purpose,
        countryId: dto.countryId,
        cityId: dto.cityId,
        neighborhoodId: dto.neighborhoodId,
        title: '',
        description: '',
        price: 0,
        currency: dto.currency ?? 'USD',
        status: 'DRAFT',
      },
      include: DETAIL_INCLUDE,
    });
    return this.toDetailItem(property);
  }

  async update(id: string, dto: UpdatePropertyDto) {
    const existing = await this.prisma.property.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Property not found');
    }

    const property = await this.prisma.property.update({
      where: { id },
      data: {
        ...(dto.type !== undefined ? { type: dto.type } : {}),
        ...(dto.purpose !== undefined ? { purpose: dto.purpose } : {}),
        ...(dto.title !== undefined ? { title: dto.title } : {}),
        ...(dto.description !== undefined ? { description: dto.description } : {}),
        ...(dto.price !== undefined ? { price: dto.price } : {}),
        ...(dto.currency !== undefined ? { currency: dto.currency } : {}),
        ...(dto.bedrooms !== undefined ? { bedrooms: dto.bedrooms } : {}),
        ...(dto.bathrooms !== undefined ? { bathrooms: dto.bathrooms } : {}),
        ...(dto.areaSqm !== undefined ? { areaSqm: dto.areaSqm } : {}),
        ...(dto.furnished !== undefined ? { furnished: dto.furnished } : {}),
        ...(dto.parking !== undefined ? { parking: dto.parking } : {}),
        ...(dto.countryId !== undefined ? { countryId: dto.countryId } : {}),
        ...(dto.cityId !== undefined ? { cityId: dto.cityId } : {}),
        ...(dto.neighborhoodId !== undefined ? { neighborhoodId: dto.neighborhoodId } : {}),
        ...(dto.amenities !== undefined ? { amenities: dto.amenities } : {}),
        ...(dto.photos !== undefined ? { photos: dto.photos } : {}),
      },
      include: DETAIL_INCLUDE,
    });
    return this.toDetailItem(property);
  }

  // Draft -> pending verification (CLAUDE.md §5 Phase 5 "done when" —
  // publishing never jumps straight to VERIFIED; that's the admin queue
  // built in Phase 7).
  async publish(id: string) {
    const existing = await this.prisma.property.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Property not found');
    }
    if (existing.status !== 'DRAFT') {
      throw new BadRequestException('Only draft listings can be published');
    }
    if (!existing.title || !existing.description || existing.price.toNumber() <= 0) {
      throw new BadRequestException('Complete the listing before publishing');
    }

    const property = await this.prisma.property.update({
      where: { id },
      data: { status: 'PENDING' },
      include: DETAIL_INCLUDE,
    });
    return this.toDetailItem(property);
  }

  // Buyer-facing — deliberately narrower than the admin status setter
  // (admin.service.ts): only a live, verified listing can be reported, and
  // it only ever moves to REPORTED, never any other status. An admin
  // reviews it from there (CLAUDE.md §5 Phase 7 verification queue).
  async report(id: string) {
    const existing = await this.prisma.property.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Property not found');
    }
    if (existing.status !== 'VERIFIED') {
      throw new BadRequestException('Only a verified listing can be reported');
    }

    const property = await this.prisma.property.update({
      where: { id },
      data: { status: 'REPORTED' },
      include: DETAIL_INCLUDE,
    });
    return this.toDetailItem(property);
  }

  // Grounding context for the AI insight/score (CLAUDE.md §4 — score every
  // dimension against real data, not vibes). Same type/purpose/city as the
  // subject property so price and space comparisons are meaningful.
  async findComparables(
    property: { id: string; type: Prisma.PropertyWhereInput['type']; purpose: Prisma.PropertyWhereInput['purpose']; cityId: string },
    limit = 5,
  ) {
    const comparables = await this.prisma.property.findMany({
      where: {
        id: { not: property.id },
        status: 'VERIFIED',
        type: property.type,
        purpose: property.purpose,
        cityId: property.cityId,
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        title: true,
        price: true,
        currency: true,
        areaSqm: true,
        bedrooms: true,
        neighborhood: { select: { name: true } },
      },
    });

    return comparables.map((c) => ({
      title: c.title,
      price: c.price.toNumber(),
      currency: c.currency,
      areaSqm: c.areaSqm,
      bedrooms: c.bedrooms,
      neighborhood: c.neighborhood?.name ?? null,
    }));
  }
}
