import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

// prefers-reduced-motion (DESIGN_SYSTEM.md §5, §10). When on, expressive
// motion — breathing scale, celebration settle, looping waves — falls back to
// a crossfade or a static state. Mirrors the OS "Reduce Motion" setting and
// updates live if the user toggles it.
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled().then((value) => {
      if (mounted) setReduced(value);
    });
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', (value) => {
      setReduced(value);
    });
    return () => {
      mounted = false;
      sub.remove();
    };
  }, []);

  return reduced;
}
