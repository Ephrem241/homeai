import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';

import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { DesignsService } from './designs.service';
import { GenerateDesignDto } from './dto/generate-design.dto';
import { SaveDesignDto } from './dto/save-design.dto';

@UseGuards(JwtAuthGuard)
@Controller('designs')
export class DesignsController {
  constructor(private readonly designsService: DesignsService) {}

  @Post('generate')
  generate(@CurrentUser() user: { id: string }, @Body() dto: GenerateDesignDto) {
    return this.designsService.generatePreview(user.id, dto);
  }

  @Post()
  save(@CurrentUser() user: { id: string }, @Body() dto: SaveDesignDto) {
    return this.designsService.saveDesign(user.id, dto);
  }

  @Get()
  findByUser(@CurrentUser() user: { id: string }) {
    return this.designsService.findByUser(user.id);
  }

  @Get(':id')
  findOne(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    return this.designsService.findOne(id, user.id);
  }

  @Delete(':id')
  remove(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    return this.designsService.remove(id, user.id);
  }
}
