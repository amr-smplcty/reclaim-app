// Whether to render the real Apple button vs. the "available in the full
// app" fallback note. Split out as a pure function so the availability-based
// rendering decision is unit-testable without mounting the account screen —
// isAvailableAsync() only resolves true on a real dev-client/EAS build; in
// Expo Go it's absent entirely, which is exactly the case this guards.
export function shouldOfferAppleSignIn(platformOS: string, isAvailable: boolean): boolean {
  return platformOS === 'ios' && isAvailable;
}
