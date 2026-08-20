import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { QueryPropertiesDto } from './dto/query-properties.dto';

const LIST_INCLUDE = {
  city: true,
  neighborhood: true,
  country: true,
  agent: { select: { businessName: true, verified: true } },
} satisfies Prisma.PropertyInclude;

type PropertyWithRelations = Prisma.PropertyGetPayload<{ include: typeof LIST_INCLUDE }>;

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

    const [total, properties] = await this.prisma.$transaction([
      this.prisma.property.count({ where }),
      this.prisma.property.findMany({
        where,
        include: LIST_INCLUDE,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

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

  async findOne(id: string) {
    const property = await this.prisma.property.findUnique({
      where: { id },
      include: { ...LIST_INCLUDE, ownerUser: { select: { name: true } } },
    });
    if (!property) {
      throw new NotFoundException('Property not found');
    }

    return {
      ...this.toListItem(property),
      description: property.description,
      amenities: property.amenities,
      photos: property.photos,
      neighborhoodId: property.neighborhoodId,
      cityId: property.cityId,
      countryId: property.countryId,
      contact: property.agent
        ? { name: property.agent.businessName, verified: property.agent.verified, type: 'agent' as const }
        : { name: property.ownerUser?.name ?? 'Owner', verified: false, type: 'owner' as const },
    };
  }
}
