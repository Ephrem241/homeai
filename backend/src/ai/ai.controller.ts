import { Body, Controller, Post } from '@nestjs/common';

import { AiService } from './ai.service';
import { ParseSearchDto } from './dto/parse-search.dto';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('parse-search')
  parseSearch(@Body() dto: ParseSearchDto) {
    return this.aiService.parseSearch(dto.query);
  }
}
