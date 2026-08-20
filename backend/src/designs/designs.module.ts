import { Module } from '@nestjs/common';

import { DesignsController } from './designs.controller';
import { DesignsService } from './designs.service';
import { IMAGE_GEN_PROVIDER } from './image-gen.provider';
import { PlaceholderImageGenProvider } from './placeholder-image-gen.provider';

@Module({
  controllers: [DesignsController],
  providers: [DesignsService, { provide: IMAGE_GEN_PROVIDER, useClass: PlaceholderImageGenProvider }],
})
export class DesignsModule {}
