import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';

import { CreatePropertyDto } from './dto/create-property.dto';
import { QueryPropertiesDto } from './dto/query-properties.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { PropertiesService } from './properties.service';

@Controller('properties')
export class PropertiesController {
  constructor(private readonly propertiesService: PropertiesService) {}

  // Static routes registered before the dynamic ":id" route below so
  // "recommended" / "popular-locations" never get captured as an id.
  @Get('recommended')
  recommended(@Query('limit') limit?: string) {
    return this.propertiesService.findRecommended(limit ? Number(limit) : undefined);
  }

  @Get('popular-locations')
  popularLocations(@Query('limit') limit?: string) {
    return this.propertiesService.findPopularLocations(limit ? Number(limit) : undefined);
  }

  @Get()
  findMany(@Query() query: QueryPropertiesDto) {
    return this.propertiesService.findMany(query);
  }

  @Post()
  create(@Body() dto: CreatePropertyDto) {
    return this.propertiesService.create(dto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.propertiesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePropertyDto) {
    return this.propertiesService.update(id, dto);
  }

  @Post(':id/publish')
  publish(@Param('id') id: string) {
    return this.propertiesService.publish(id);
  }

  @Post(':id/report')
  report(@Param('id') id: string) {
    return this.propertiesService.report(id);
  }
}
