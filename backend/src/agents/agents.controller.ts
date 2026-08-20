import { Controller, Get, Param } from '@nestjs/common';

import { AgentsService } from './agents.service';

@Controller('agents')
export class AgentsController {
  constructor(private readonly agentsService: AgentsService) {}

  @Get('demo')
  getDemoAgent() {
    return this.agentsService.getDemoAgent();
  }

  @Get(':id/dashboard')
  getDashboard(@Param('id') id: string) {
    return this.agentsService.getDashboard(id);
  }

  @Get(':id/listings')
  getListings(@Param('id') id: string) {
    return this.agentsService.findListings(id);
  }
}
