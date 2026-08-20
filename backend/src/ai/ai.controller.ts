import { Body, Controller, ForbiddenException, Get, Param, Post, UseGuards } from '@nestjs/common';

import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/optional-jwt-auth.guard';
import { PropertiesService } from '../properties/properties.service';
import { AiService } from './ai.service';
import { ChatMessageDto } from './dto/chat-message.dto';
import { ParseSearchDto } from './dto/parse-search.dto';

@Controller('ai')
export class AiController {
  constructor(
    private readonly aiService: AiService,
    private readonly propertiesService: PropertiesService,
  ) {}

  @Post('parse-search')
  parseSearch(@Body() dto: ParseSearchDto) {
    return this.aiService.parseSearch(dto.query);
  }

  // Optional auth: the score/breakdown are public, only the Investment
  // Analysis section gates on subscription tier (CLAUDE.md §5 Phase 7) —
  // anonymous browsing still needs to work, just always gated.
  @UseGuards(OptionalJwtAuthGuard)
  @Get('properties/:id/insight')
  getInsight(@Param('id') id: string, @CurrentUser() user?: { id: string }) {
    return this.aiService.getPropertyInsight(id, user?.id);
  }

  // Behind auth so the Claude-backed endpoint isn't open to anonymous abuse.
  @UseGuards(JwtAuthGuard)
  @Post('properties/:id/chat')
  chat(@Param('id') id: string, @Body() dto: ChatMessageDto) {
    return this.aiService.chatAboutProperty(id, dto.message, dto.history ?? []);
  }

  // Agent-only, and only for their own listing — reuses the contact.userId
  // already resolved onto the property detail payload (properties.service.ts)
  // rather than a second ownership lookup.
  @UseGuards(JwtAuthGuard)
  @Post('properties/:id/listing-assistant')
  async generateListingCopy(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    const property = await this.propertiesService.findOne(id);
    if (property.contact.userId !== user.id) {
      throw new ForbiddenException('Not your listing');
    }
    return this.aiService.generateListingCopy(id);
  }
}
