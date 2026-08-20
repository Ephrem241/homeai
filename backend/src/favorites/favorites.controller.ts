import { Body, Controller, Get, Post, Query } from '@nestjs/common';

import { ToggleFavoriteDto } from './dto/toggle-favorite.dto';
import { FavoritesService } from './favorites.service';

@Controller('favorites')
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Get()
  list(@Query('userId') userId: string) {
    return this.favoritesService.list(userId);
  }

  @Post('toggle')
  toggle(@Body() dto: ToggleFavoriteDto) {
    return this.favoritesService.toggle(dto);
  }
}
