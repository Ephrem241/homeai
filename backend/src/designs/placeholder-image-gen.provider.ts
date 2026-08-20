import { Injectable } from '@nestjs/common';

import type { GeneratedDesign, ImageGenProvider } from './image-gen.provider';

// No image-gen provider is configured for this build (CLAUDE.md §5 Phase 6
// explicitly allows shipping this stub — "generate redesign (behind a
// swappable image-gen interface — stub with a placeholder provider if none
// configured)"). Returns a fixed, clearly-labeled styled-interior stock
// photo so the full upload -> generate -> compare -> save loop is real and
// testable end to end without pretending to be a genuine AI redesign.
@Injectable()
export class PlaceholderImageGenProvider implements ImageGenProvider {
  async generateDesign(_originalImageUrl: string, _roomType: string, _style: string): Promise<GeneratedDesign> {
    return {
      imageUrl: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6',
      isPlaceholder: true,
    };
  }
}
