
export interface AudioConfig {
  startSoundPath: string;
  endSoundPath: string;
}

export interface AudioState {
  audioInitialized: boolean;
  audioContext: AudioContext | null;
  startAudioBuffer: AudioBuffer | null;
  endAudioBuffer: AudioBuffer | null;
  lastIOSPlayAttempt: number;
  soundBlockedUntil: number;
  isIOS: boolean;
}
