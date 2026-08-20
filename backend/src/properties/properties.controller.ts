import { Body, Controller, ForbiddenException, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';

import { AgentsService } from '../agents/agents.service';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreatePropertyDto } from './dto/create-property.dto';
import { QueryPropertiesDto } from './dto/query-properties.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { PropertiesService } from './properties.service';

@Controller('properties')
export class PropertiesController {
  constructor(
    private readonly propertiesService: PropertiesService,
    private readonly agentsService: AgentsService,
  ) {}

  // Shared by create/update/publish — every listing-authoring endpoint
  // requires an agent profile, resolved from the caller's token so agentId
  // is never client-suppliable.
  private async requireAgentId(userId: string): Promise<string> {
    const agent = await this.agentsService.findByUserId(userId);
    if (!agent) {
      throw new ForbiddenException('Create an agent profile before listing properties.');
    }
    return agent.id;
  }

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

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@CurrentUser() user: { id: string }, @Body() dto: CreatePropertyDto) {
    const agentId = await this.requireAgentId(user.id);
    return this.propertiesService.create(agentId, dto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.propertiesService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(@CurrentUser() user: { id: string }, @Param('id') id: string, @Body() dto: UpdatePropertyDto) {
    const agentId = await this.requireAgentId(user.id);
    return this.propertiesService.update(id, agentId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/publish')
  async publish(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    const agentId = await this.requireAgentId(user.id);
    return this.propertiesService.publish(id, agentId);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/report')
  report(@Param('id') id: string) {
    return this.propertiesService.report(id);
  }
}
