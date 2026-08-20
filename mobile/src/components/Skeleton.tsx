import { useEffect, useRef } from 'react';
import { Animated, type ViewProps } from 'react-native';

// Static "skeleton" placeholder used while data is loading. Pulses gently
// instead of a spinner, per CLAUDE.md §8 direction to prefer skeletons.
export default function SkeletonBlock({ className, style, ...props }: ViewProps) {
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.4, duration: 700, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return (
    <Animated.View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      className={`bg-mist ${className ?? ''}`}
      style={[{ opacity }, style]}
      {...props}
    />
  );
}
