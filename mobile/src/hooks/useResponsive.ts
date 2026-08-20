import { useWindowDimensions } from 'react-native';

// CLAUDE.md §5 Phase 8 — tablet/iPad adaptation, not just a stretched phone
// layout. 768px matches the iPad Mini portrait width, the common phone/tablet
// cutoff.
const TABLET_BREAKPOINT = 768;

export function useResponsive() {
  const { width } = useWindowDimensions();
  const isTablet = width >= TABLET_BREAKPOINT;
  return { width, isTablet, columns: isTablet ? 2 : 1 };
}
