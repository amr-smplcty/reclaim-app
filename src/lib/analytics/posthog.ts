import PostHog from 'posthog-react-native';

let client: PostHog | null = null;

// Lazily constructed so importing this module never fires network calls on its own.
// Event instrumentation follows the exact names in PRODUCT_SPEC §8 as each feature ships.
export function getAnalyticsClient(): PostHog | null {
  if (client) return client;

  const apiKey = process.env.EXPO_PUBLIC_POSTHOG_KEY;
  if (!apiKey) {
    console.warn('PostHog key missing — set EXPO_PUBLIC_POSTHOG_KEY in .env');
    return null;
  }

  client = new PostHog(apiKey, { host: 'https://us.i.posthog.com' });
  return client;
}
