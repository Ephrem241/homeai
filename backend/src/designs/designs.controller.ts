import { Body, Controller, Delete, Get, Param, Post, Query } from '@nestjs/common';

import { DesignsService } from './designs.service';
import { GenerateDesignDto } from './dto/generate-design.dto';
import { SaveDesignDto } from './dto/save-design.dto';

@Controller('designs')
export class DesignsController {
  constructor(private readonly designsService: DesignsService) {}

  @Post('generate')
  generate(@Body() dto: GenerateDesignDto) {
    return this.designsService.generatePreview(dto);
  }

  @Post()
  save(@Body() dto: SaveDesignDto) {
    return this.designsService.saveDesign(dto);
  }

  @Get()
  findByUser(@Query('userId') userId: string) {
    return this.designsService.findByUser(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Query('userId') userId: string) {
    return this.designsService.findOne(id, userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Query('userId') userId: string) {
    return this.designsService.remove(id, userId);
  }
}
