import { useEffect, useState } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';

/** Re-calculated on the client for static web rendering. */
export function useColorScheme() {
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  const colorScheme = useRNColorScheme();

  if (hasHydrated) {
    return colorScheme;
  }

  return 'dark';
}
