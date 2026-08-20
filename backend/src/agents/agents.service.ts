import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import type { CreateAgentDto } from './dto/create-agent.dto';

const AGENT_INCLUDE = { user: { select: { name: true, phone: true, email: true } } } as const;

@Injectable()
export class AgentsService {
  constructor(private readonly prisma: PrismaService) {}

  // Returns null (not a 404) when the current user isn't an agent yet — a
  // regular buyer visiting Profile should see "become an agent", not an
  // error.
  findByUserId(userId: string) {
    return this.prisma.agent.findUnique({ where: { userId }, include: AGENT_INCLUDE });
  }

  async create(userId: string, dto: CreateAgentDto) {
    const existing = await this.prisma.agent.findUnique({ where: { userId } });
    if (existing) {
      throw new BadRequestException('You already have an agent profile.');
    }

    return this.prisma.$transaction(async (tx) => {
      const agent = await tx.agent.create({
        data: { userId, businessName: dto.businessName, bio: dto.bio },
        include: AGENT_INCLUDE,
      });
      // Grants listing-creation access; verification (the "Agent Verified"
      // badge) still goes through the admin queue separately (CLAUDE.md §4).
      await tx.user.update({ where: { id: userId }, data: { role: 'AGENT' } });
      return agent;
    });
  }

  private async assertOwnership(agentId: string, userId: string) {
    const agent = await this.prisma.agent.findUnique({ where: { id: agentId } });
    if (!agent) {
      throw new NotFoundException('Agent not found');
    }
    if (agent.userId !== userId) {
      throw new NotFoundException('Agent not found');
    }
  }

  async getDashboard(agentId: string, userId: string) {
    await this.assertOwnership(agentId, userId);

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

  async findListings(agentId: string, userId: string) {
    await this.assertOwnership(agentId, userId);

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
