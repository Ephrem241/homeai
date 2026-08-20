import { Logger, Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { DesignsController } from './designs.controller';
import { DesignsService } from './designs.service';
import { IMAGE_GEN_PROVIDER } from './image-gen.provider';
import { PlaceholderImageGenProvider } from './placeholder-image-gen.provider';
import { ReplicateImageGenProvider } from './replicate-image-gen.provider';

const hasReplicate = Boolean(process.env.REPLICATE_API_TOKEN);
if (!hasReplicate) {
  new Logger('DesignsModule').warn(
    'REPLICATE_API_TOKEN is not set — AI Designer will return a placeholder image instead of a real redesign.',
  );
}

@Module({
  imports: [AuthModule],
  controllers: [DesignsController],
  providers: [
    DesignsService,
    {
      provide: IMAGE_GEN_PROVIDER,
      useClass: hasReplicate ? ReplicateImageGenProvider : PlaceholderImageGenProvider,
    },
  ],
})
export class DesignsModule {}
