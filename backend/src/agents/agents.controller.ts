import { Body, Controller, Get, NotFoundException, Post, UseGuards } from '@nestjs/common';

import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AgentsService } from './agents.service';
import { CreateAgentDto } from './dto/create-agent.dto';

@UseGuards(JwtAuthGuard)
@Controller('agents')
export class AgentsController {
  constructor(private readonly agentsService: AgentsService) {}

  // Wrapped in { agent } rather than returning the bare value — Nest/Express
  // send an empty body (not the JSON literal "null") for a controller
  // returning null, which a JSON.parse-based client can't tell apart from
  // "no body at all" (see mobile's api/client.ts apiRequest).
  @Get('me')
  async getMine(@CurrentUser() user: { id: string }) {
    return { agent: await this.agentsService.findByUserId(user.id) };
  }

  @Post()
  create(@CurrentUser() user: { id: string }, @Body() dto: CreateAgentDto) {
    return this.agentsService.create(user.id, dto);
  }

  @Get('me/dashboard')
  async getMyDashboard(@CurrentUser() user: { id: string }) {
    const agent = await this.agentsService.findByUserId(user.id);
    if (!agent) throw new NotFoundException('No agent profile yet');
    return this.agentsService.getDashboard(agent.id, user.id);
  }

  @Get('me/listings')
  async getMyListings(@CurrentUser() user: { id: string }) {
    const agent = await this.agentsService.findByUserId(user.id);
    if (!agent) throw new NotFoundException('No agent profile yet');
    return this.agentsService.findListings(agent.id, user.id);
  }
}
