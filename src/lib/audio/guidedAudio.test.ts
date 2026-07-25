const mockCreateAudioPlayer = jest.fn();

// INC-11: reference outer mock* variables only through a closure, never directly.
jest.mock('expo-audio', () => ({
  createAudioPlayer: (...args: unknown[]) => mockCreateAudioPlayer(...args),
}));

import { playGuidedAudio } from '@/lib/audio/guidedAudio';

describe('playGuidedAudio (INC-2: availability-check + graceful degradation)', () => {
  beforeEach(() => {
    mockCreateAudioPlayer.mockReset();
  });

  it('no-ops (returns null, never touches the native module) when there is no source — the current TODO(content) state', () => {
    expect(playGuidedAudio(null)).toBeNull();
    expect(playGuidedAudio(undefined)).toBeNull();
    expect(playGuidedAudio('')).toBeNull();
    expect(mockCreateAudioPlayer).not.toHaveBeenCalled();
  });

  it('plays the source and returns a stop handle when a real audio url is present', () => {
    const player = { play: jest.fn(), remove: jest.fn() };
    mockCreateAudioPlayer.mockReturnValue(player);

    const handle = playGuidedAudio('https://cdn.example/urge-surf.mp3');

    expect(mockCreateAudioPlayer).toHaveBeenCalledWith('https://cdn.example/urge-surf.mp3');
    expect(player.play).toHaveBeenCalledTimes(1);
    expect(handle).not.toBeNull();

    handle?.stop();
    expect(player.remove).toHaveBeenCalledTimes(1);
  });

  it('degrades to null (never throws) when the native module is unavailable — Expo Go', () => {
    mockCreateAudioPlayer.mockImplementation(() => {
      throw new Error('Native module ExpoAudio is not available');
    });
    expect(() => playGuidedAudio('https://cdn.example/urge-surf.mp3')).not.toThrow();
    expect(playGuidedAudio('https://cdn.example/urge-surf.mp3')).toBeNull();
  });

  it('stop() swallows a double-release without throwing', () => {
    const player = {
      play: jest.fn(),
      remove: jest.fn().mockImplementationOnce(() => {}).mockImplementationOnce(() => {
        throw new Error('already released');
      }),
    };
    mockCreateAudioPlayer.mockReturnValue(player);

    const handle = playGuidedAudio('https://cdn.example/urge-surf.mp3');
    handle?.stop();
    expect(() => handle?.stop()).not.toThrow();
  });
});
