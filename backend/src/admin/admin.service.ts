import { Injectable, NotFoundException } from '@nestjs/common';
import type { PropertyStatus } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getOverview() {
    const [totalUsers, totalAgents, verifiedAgents, propertyStatusCounts, totalLeads, totalMessages] =
      await Promise.all([
        this.prisma.user.count(),
        this.prisma.agent.count(),
        this.prisma.agent.count({ where: { verified: true } }),
        this.prisma.property.groupBy({ by: ['status'], _count: { _all: true } }),
        this.prisma.lead.count(),
        this.prisma.message.count(),
      ]);

    const byStatus: Record<string, number> = {
      DRAFT: 0,
      PENDING: 0,
      VERIFIED: 0,
      REPORTED: 0,
      UNAVAILABLE: 0,
    };
    for (const row of propertyStatusCounts) {
      byStatus[row.status] = row._count._all;
    }

    return {
      totalUsers,
      totalAgents,
      verifiedAgents,
      totalProperties: Object.values(byStatus).reduce((sum, n) => sum + n, 0),
      byStatus,
      totalLeads,
      totalMessages,
    };
  }

  findUsers() {
    return this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        role: true,
        subscriptionTier: true,
        createdAt: true,
      },
    });
  }

  async findAgents() {
    const agents = await this.prisma.agent.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, phone: true, email: true } },
        _count: { select: { listings: true } },
      },
    });
    return agents.map((agent) => ({
      id: agent.id,
      businessName: agent.businessName,
      verified: agent.verified,
      userName: agent.user.name,
      userPhone: agent.user.phone,
      listingCount: agent._count.listings,
      createdAt: agent.createdAt,
    }));
  }

  async verifyAgent(id: string) {
    const agent = await this.prisma.agent.findUnique({ where: { id } });
    if (!agent) {
      throw new NotFoundException('Agent not found');
    }
    return this.prisma.agent.update({ where: { id }, data: { verified: true } });
  }

  async findProperties(status?: PropertyStatus) {
    const properties = await this.prisma.property.findMany({
      where: status ? { status } : {},
      orderBy: { updatedAt: 'desc' },
      include: { agent: { select: { businessName: true } }, ownerUser: { select: { name: true } } },
      take: 100,
    });
    return properties.map((property) => ({
      id: property.id,
      title: property.title || 'Untitled draft',
      status: property.status,
      type: property.type,
      purpose: property.purpose,
      price: property.price.toNumber(),
      currency: property.currency,
      photo: property.photos[0] ?? null,
      listedBy: property.agent?.businessName ?? property.ownerUser?.name ?? 'Unknown',
      createdAt: property.createdAt,
      updatedAt: property.updatedAt,
    }));
  }

  async updatePropertyStatus(id: string, status: PropertyStatus) {
    const existing = await this.prisma.property.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Property not found');
    }
    return this.prisma.property.update({ where: { id }, data: { status } });
  }
}
