import { Module } from '@nestjs/common';

import { LocationsModule } from '../locations/locations.module';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';

@Module({
  imports: [LocationsModule],
  controllers: [AiController],
  providers: [AiService],
})
export class AiModule {}
