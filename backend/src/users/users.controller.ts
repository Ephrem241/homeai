import { Body, Controller, Get, Param, Patch } from '@nestjs/common';

import { UpdateTierDto } from './dto/update-tier.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('demo')
  getDemoUser() {
    return this.usersService.getDemoUser();
  }

  @Patch(':id/tier')
  updateTier(@Param('id') id: string, @Body() dto: UpdateTierDto) {
    return this.usersService.updateTier(id, dto.tier);
  }
}
