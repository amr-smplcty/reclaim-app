import { createAudioPlayer } from 'expo-audio';

export interface GuidedAudioHandle {
  stop: () => void;
}

// INC-2 (availability-check + graceful degradation): the guided-audio module
// is a native module — absent in Expo Go — and most tools have no audio track
// yet (TODO(content), BACKLOG #4: the Urge Surf narration is authored but not
// recorded/TTS-generated). BOTH cases must no-op silently, never throw: the
// tool keeps working visually with no audio. Returns a handle to stop on
// unmount, or null when nothing is playing (no source, or module unavailable).
//
// This replaces the never-wired expo-av dependency (removed in Expo SDK 54;
// see INCIDENTS.md) — expo-av had no call sites at all, so this is the audio
// integration point the toolkit tools were always missing, built on the
// supported expo-audio module.
export function playGuidedAudio(source: string | null | undefined): GuidedAudioHandle | null {
  if (!source) return null;
  try {
    const player = createAudioPlayer(source);
    player.play();
    return {
      stop: () => {
        try {
          player.remove();
        } catch {
          // Player already released (double-stop, or teardown mid-load) — ignore.
        }
      },
    };
  } catch {
    // Native module unavailable (Expo Go) or an invalid source — degrade to
    // visual-only, exactly as the tools already behave with no audio.
    return null;
  }
}
