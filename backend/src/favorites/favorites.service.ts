import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { ToggleFavoriteDto } from './dto/toggle-favorite.dto';

@Injectable()
export class FavoritesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(userId: string) {
    const saved = await this.prisma.savedProperty.findMany({
      where: { userId },
      include: {
        property: {
          include: {
            city: true,
            neighborhood: true,
            agent: { select: { businessName: true, verified: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return saved.map((entry) => ({
      id: entry.property.id,
      type: entry.property.type,
      purpose: entry.property.purpose,
      title: entry.property.title,
      price: entry.property.price.toNumber(),
      currency: entry.property.currency,
      bedrooms: entry.property.bedrooms,
      bathrooms: entry.property.bathrooms,
      areaSqm: entry.property.areaSqm,
      city: entry.property.city.name,
      neighborhood: entry.property.neighborhood?.name ?? null,
      photo: entry.property.photos[0] ?? null,
      status: entry.property.status,
      agentVerified: entry.property.agent?.verified ?? false,
      savedAt: entry.createdAt,
    }));
  }

  async toggle(userId: string, { propertyId }: ToggleFavoriteDto) {
    const existing = await this.prisma.savedProperty.findUnique({
      where: { userId_propertyId: { userId, propertyId } },
    });

    if (existing) {
      await this.prisma.savedProperty.delete({ where: { id: existing.id } });
      return { saved: false };
    }

    await this.prisma.savedProperty.create({ data: { userId, propertyId } });
    return { saved: true };
  }
}
