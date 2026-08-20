import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';

import { AiService } from './ai.service';
import { ChatMessageDto } from './dto/chat-message.dto';
import { ParseSearchDto } from './dto/parse-search.dto';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('parse-search')
  parseSearch(@Body() dto: ParseSearchDto) {
    return this.aiService.parseSearch(dto.query);
  }

  @Get('properties/:id/insight')
  getInsight(@Param('id') id: string, @Query('userId') userId?: string) {
    return this.aiService.getPropertyInsight(id, userId);
  }

  @Post('properties/:id/chat')
  chat(@Param('id') id: string, @Body() dto: ChatMessageDto) {
    return this.aiService.chatAboutProperty(id, dto.message, dto.history ?? []);
  }

  @Post('properties/:id/listing-assistant')
  generateListingCopy(@Param('id') id: string) {
    return this.aiService.generateListingCopy(id);
  }
}
