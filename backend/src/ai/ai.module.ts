import { Module } from '@nestjs/common';

import { LocationsModule } from '../locations/locations.module';
import { PropertiesModule } from '../properties/properties.module';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';

@Module({
  imports: [LocationsModule, PropertiesModule],
  controllers: [AiController],
  providers: [AiService],
})
export class AiModule {}
