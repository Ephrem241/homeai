import { Controller, Get, Param, Query } from '@nestjs/common';

import { LocationsService } from './locations.service';

@Controller('locations')
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}

  @Get()
  findChildren(@Query('parentId') parentId?: string, @Query('type') type?: string) {
    return this.locationsService.findChildren(parentId, type);
  }

  @Get('search')
  search(@Query('q') q = '') {
    const trimmed = q.trim();
    if (!trimmed) return [];
    return this.locationsService.search(trimmed);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.locationsService.findOne(id);
  }
}
