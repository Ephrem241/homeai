import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LocationsService {
  constructor(private readonly prisma: PrismaService) {}

  // No parentId means root-level (type="country") rows — the top of the
  // hierarchy, matching CLAUDE.md's country -> city -> neighborhood model.
  findChildren(parentId?: string, type?: string) {
    return this.prisma.location.findMany({
      where: {
        parentId: parentId ?? null,
        ...(type ? { type } : {}),
      },
      orderBy: { name: 'asc' },
    });
  }

  async search(query: string, limit = 20) {
    const locations = await this.prisma.location.findMany({
      where: { name: { contains: query, mode: 'insensitive' } },
      include: { parent: { include: { parent: true } } },
      take: limit,
      orderBy: { name: 'asc' },
    });

    return locations.map((location) => ({
      id: location.id,
      name: location.name,
      type: location.type,
      countryCode: location.countryCode,
      currency: location.currency,
      breadcrumb: [location.parent?.parent?.name, location.parent?.name]
        .filter(Boolean)
        .join(', '),
    }));
  }

  findOne(id: string) {
    return this.prisma.location.findUnique({ where: { id } });
  }
}
