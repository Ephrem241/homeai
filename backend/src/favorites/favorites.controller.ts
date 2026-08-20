import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';

import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ToggleFavoriteDto } from './dto/toggle-favorite.dto';
import { FavoritesService } from './favorites.service';

@UseGuards(JwtAuthGuard)
@Controller('favorites')
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Get()
  list(@CurrentUser() user: { id: string }) {
    return this.favoritesService.list(user.id);
  }

  @Post('toggle')
  toggle(@CurrentUser() user: { id: string }, @Body() dto: ToggleFavoriteDto) {
    return this.favoritesService.toggle(user.id, dto);
  }
}
