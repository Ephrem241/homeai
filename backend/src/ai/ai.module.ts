import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { LocationsModule } from '../locations/locations.module';
import { PropertiesModule } from '../properties/properties.module';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';

@Module({
  imports: [AuthModule, LocationsModule, PropertiesModule],
  controllers: [AiController],
  providers: [AiService],
})
export class AiModule {}
