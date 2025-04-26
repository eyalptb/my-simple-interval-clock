
export const createAudioElement = (src: string): HTMLAudioElement => {
  const audio = new Audio(src);
  audio.preload = 'auto';
  audio.volume = 1.0;
  audio.onerror = (e) => {
    console.error(`Error loading sound:`, e);
  };
  return audio;
};

export const initializeWebAudio = (): AudioContext | null => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContext) {
      const context = new AudioContext();
      console.log('Audio Context created successfully');
      return context;
    }
  } catch (e) {
    console.log('WebAudio API not supported, falling back to HTML Audio API');
  }
  return null;
};
