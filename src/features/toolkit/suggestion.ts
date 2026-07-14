export type SuggestedTool = 'urge_surf' | 'breather';
export type DeltaDescription = 'better' | 'same' | 'worse';

// CLINICAL_SPEC §5.1 urge protocol: Urge Surf at/above 6, Breather below 6.
export function suggestToolForIntensity(intensity: number): SuggestedTool {
  if (intensity < 1 || intensity > 10) {
    throw new Error(`Intensity must be between 1 and 10, got ${intensity}`);
  }
  return intensity >= 6 ? 'urge_surf' : 'breather';
}

export function describeDelta(preIntensity: number, postIntensity: number): DeltaDescription {
  if (postIntensity < preIntensity) return 'better';
  if (postIntensity > preIntensity) return 'worse';
  return 'same';
}

// CLINICAL_SPEC §5.5: if the 10-Minute Shift didn't help (urge held or grew),
// offer Urge Surf next — an escalation path, never shame copy.
export function shouldOfferUrgeSurfEscalation(preIntensity: number, postIntensity: number): boolean {
  return postIntensity >= preIntensity;
}
