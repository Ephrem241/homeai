import { Body, Controller, Patch, UseGuards } from '@nestjs/common';

import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UpdateTierDto } from './dto/update-tier.dto';
import { UsersService } from './users.service';

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // Real payment processing is an explicit MVP non-goal (CLAUDE.md §7) —
  // this stands in for a payment provider, immediately setting the tier so
  // the rest of the gating logic (Phase 7) can be built and tested end to
  // end. Operates on the caller's own account only — never takes an :id.
  @Patch('me/tier')
  updateTier(@CurrentUser() user: { id: string }, @Body() dto: UpdateTierDto) {
    return this.usersService.updateTier(user.id, dto.tier);
  }
}
