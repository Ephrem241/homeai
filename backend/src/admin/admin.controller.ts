import { Body, Controller, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import type { PropertyStatus } from '@prisma/client';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { AdminService } from './admin.service';
import { UpdatePropertyStatusDto } from './dto/update-property-status.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('overview')
  getOverview() {
    return this.adminService.getOverview();
  }

  @Get('users')
  findUsers() {
    return this.adminService.findUsers();
  }

  @Get('agents')
  findAgents() {
    return this.adminService.findAgents();
  }

  @Patch('agents/:id/verify')
  verifyAgent(@Param('id') id: string) {
    return this.adminService.verifyAgent(id);
  }

  @Get('properties')
  findProperties(@Query('status') status?: PropertyStatus) {
    return this.adminService.findProperties(status);
  }

  @Patch('properties/:id/status')
  updatePropertyStatus(@Param('id') id: string, @Body() dto: UpdatePropertyStatusDto) {
    return this.adminService.updatePropertyStatus(id, dto.status);
  }
}
