import { Controller, Get, Param, Query } from '@nestjs/common';

import { QueryPropertiesDto } from './dto/query-properties.dto';
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

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.propertiesService.findOne(id);
  }
}
