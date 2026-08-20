import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { GenerateDesignDto } from './dto/generate-design.dto';
import { SaveDesignDto } from './dto/save-design.dto';
import { IMAGE_GEN_PROVIDER, type ImageGenProvider } from './image-gen.provider';

// CLAUDE.md §5 Phase 7 — "AI designer generations/month" is a suggested
// gated premium feature. Generation itself isn't persisted (preview-only),
// so saved designs this calendar month stand in as the usage count.
const FREE_TIER_MONTHLY_DESIGN_LIMIT = 2;

export type GeneratePreviewResult = {
  imageUrl: string;
  isPlaceholder: boolean;
  gated: boolean;
  limit?: number;
  used?: number;
};

@Injectable()
export class DesignsService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(IMAGE_GEN_PROVIDER) private readonly imageGenProvider: ImageGenProvider,
  ) {}

  // A generation is only a preview — nothing is written to the database
  // (and so nothing appears in "My Designs") until the user explicitly
  // saves it, per CLAUDE.md §5 Phase 6's generate -> compare -> save flow.
  async generatePreview(userId: string, dto: GenerateDesignDto): Promise<GeneratePreviewResult> {
    const limitCheck = await this.checkDesignLimit(userId);
    if (!limitCheck.allowed) {
      return { imageUrl: '', isPlaceholder: false, gated: true, limit: limitCheck.limit, used: limitCheck.used };
    }

    const result = await this.imageGenProvider.generateDesign(dto.originalImage, dto.roomType, dto.style);
    return { ...result, gated: false };
  }

  private async checkDesignLimit(userId: string): Promise<{ allowed: boolean; limit?: number; used?: number }> {
    const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { subscriptionTier: true } });
    if (!user || user.subscriptionTier !== 'FREE') return { allowed: true };

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const used = await this.prisma.aIDesign.count({ where: { userId, createdAt: { gte: startOfMonth } } });
    return { allowed: used < FREE_TIER_MONTHLY_DESIGN_LIMIT, limit: FREE_TIER_MONTHLY_DESIGN_LIMIT, used };
  }

  saveDesign(userId: string, dto: SaveDesignDto) {
    return this.prisma.aIDesign.create({
      data: {
        userId,
        propertyId: dto.propertyId,
        originalImage: dto.originalImage,
        generatedImage: dto.generatedImage,
        roomType: dto.roomType,
        style: dto.style,
      },
    });
  }

  findByUser(userId: string) {
    return this.prisma.aIDesign.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
  }

  async findOne(id: string, userId: string) {
    const design = await this.prisma.aIDesign.findUnique({ where: { id } });
    if (!design || design.userId !== userId) {
      throw new NotFoundException('Design not found');
    }
    return design;
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId);
    await this.prisma.aIDesign.delete({ where: { id } });
  }
}
