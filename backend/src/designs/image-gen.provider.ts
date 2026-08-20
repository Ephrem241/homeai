export type GeneratedDesign = {
  imageUrl: string;
  // True when this came from the placeholder provider rather than a real
  // image-gen backend — the UI must say so, never present it as a genuine
  // AI redesign (CLAUDE.md §4 — no manipulative/misleading claims).
  isPlaceholder: boolean;
};

// Swappable per CLAUDE.md §1 ("Image generation... is a separate provider
// behind a swappable interface"). Implement this against a real service
// (Stability AI, Replicate, etc.) and swap the DI binding in designs.module.ts
// — nothing else in the designs flow changes.
export interface ImageGenProvider {
  generateDesign(originalImageUrl: string, roomType: string, style: string): Promise<GeneratedDesign>;
}

export const IMAGE_GEN_PROVIDER = Symbol('IMAGE_GEN_PROVIDER');
