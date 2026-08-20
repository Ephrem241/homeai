import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { GenerateDesignDto } from './dto/generate-design.dto';
import { SaveDesignDto } from './dto/save-design.dto';
import { IMAGE_GEN_PROVIDER, type ImageGenProvider } from './image-gen.provider';

@Injectable()
export class DesignsService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(IMAGE_GEN_PROVIDER) private readonly imageGenProvider: ImageGenProvider,
  ) {}

  // A generation is only a preview — nothing is written to the database
  // (and so nothing appears in "My Designs") until the user explicitly
  // saves it, per CLAUDE.md §5 Phase 6's generate -> compare -> save flow.
  generatePreview(dto: GenerateDesignDto) {
    return this.imageGenProvider.generateDesign(dto.originalImage, dto.roomType, dto.style);
  }

  saveDesign(dto: SaveDesignDto) {
    return this.prisma.aIDesign.create({
      data: {
        userId: dto.userId,
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
