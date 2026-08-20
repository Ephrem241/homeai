import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

const AGENT_INCLUDE = { user: { select: { name: true, phone: true, email: true } } } as const;

@Injectable()
export class AgentsService {
  constructor(private readonly prisma: PrismaService) {}

  // Same "demo persona" stand-in as UsersService.getDemoUser (CLAUDE.md §1 —
  // real Phone OTP auth isn't built yet). Prefers a verified agent for a
  // fuller dashboard demo; seed-agnostic, works with any locale's data.
  async getDemoAgent() {
    const agent =
      (await this.prisma.agent.findFirst({
        where: { verified: true },
        orderBy: { createdAt: 'asc' },
        include: AGENT_INCLUDE,
      })) ??
      (await this.prisma.agent.findFirst({ orderBy: { createdAt: 'asc' }, include: AGENT_INCLUDE }));

    if (!agent) {
      throw new NotFoundException('No agent available');
    }
    return agent;
  }

  private async assertExists(id: string) {
    const agent = await this.prisma.agent.findUnique({ where: { id } });
    if (!agent) {
      throw new NotFoundException('Agent not found');
    }
  }

  async getDashboard(agentId: string) {
    await this.assertExists(agentId);

    const [statusCounts, totalLeads, recentLeads] = await Promise.all([
      this.prisma.property.groupBy({ by: ['status'], where: { agentId }, _count: { _all: true } }),
      this.prisma.lead.count({ where: { agentId } }),
      this.prisma.lead.findMany({
        where: { agentId },
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: { property: { select: { title: true } }, user: { select: { name: true } } },
      }),
    ]);

    const byStatus: Record<string, number> = {
      DRAFT: 0,
      PENDING: 0,
      VERIFIED: 0,
      REPORTED: 0,
      UNAVAILABLE: 0,
    };
    for (const row of statusCounts) {
      byStatus[row.status] = row._count._all;
    }

    return {
      totalListings: Object.values(byStatus).reduce((sum, n) => sum + n, 0),
      byStatus,
      totalLeads,
      recentLeads: recentLeads.map((lead) => ({
        id: lead.id,
        propertyTitle: lead.property.title || 'Untitled draft',
        userName: lead.user.name,
        status: lead.status,
        createdAt: lead.createdAt,
      })),
    };
  }

  async findListings(agentId: string) {
    await this.assertExists(agentId);

    const properties = await this.prisma.property.findMany({
      where: { agentId },
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        title: true,
        status: true,
        price: true,
        currency: true,
        type: true,
        purpose: true,
        photos: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return properties.map((property) => ({
      id: property.id,
      title: property.title || 'Untitled draft',
      status: property.status,
      price: property.price.toNumber(),
      currency: property.currency,
      type: property.type,
      purpose: property.purpose,
      photo: property.photos[0] ?? null,
      createdAt: property.createdAt,
      updatedAt: property.updatedAt,
    }));
  }
}
