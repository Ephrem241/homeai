import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { DesignsController } from './designs.controller';
import { DesignsService } from './designs.service';
import { IMAGE_GEN_PROVIDER } from './image-gen.provider';
import { PlaceholderImageGenProvider } from './placeholder-image-gen.provider';

@Module({
  imports: [AuthModule],
  controllers: [DesignsController],
  providers: [DesignsService, { provide: IMAGE_GEN_PROVIDER, useClass: PlaceholderImageGenProvider }],
})
export class DesignsModule {}
