// Mirrors the color/radius tokens in tailwind.config.js. Kept in sync manually
// (see CLAUDE.md §2) for the handful of places that need a raw value instead
// of a className — e.g. navigation theming, icon `color` props, SVGs.
export const colors = {
  navy: '#0B1F33',
  slate: '#263746',
  gold: '#C89B5D',
  ivory: '#F7F5F0',
  white: '#FFFFFF',
  mist: '#EEF1F3',
  charcoal: '#17212B',
  slateGray: '#68737D',
  success: '#237A57',
  warning: '#D89B35',
  error: '#C94C4C',
} as const;

export const radii = {
  sm: 10,
  md: 16,
  lg: 22,
  hero: 20,
} as const;

export type ColorToken = keyof typeof colors;
