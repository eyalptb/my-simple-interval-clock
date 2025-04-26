interface AudioConfig {
  startSoundPath: string;
  endSoundPath: string;
}

class AudioService {
  private static instance: AudioService;
  private audioConfig: AudioConfig = {
    startSoundPath: '/assets/audio/go.mp3',
    endSoundPath: '/assets/audio/whistle.mp3'
  };

  private constructor() {}

  public static getInstance(): AudioService {
    if (!AudioService.instance) {
      AudioService.instance = new AudioService();
    }
    return AudioService.instance;
  }

  public createAudio(type: 'start' | 'end'): HTMLAudioElement | undefined {
    try {
      const audio = new Audio();
      
      if (type === 'start') {
        audio.src = this.audioConfig.startSoundPath;
        console.log('Creating go.mp3 sound');
      } else {
        audio.src = this.audioConfig.endSoundPath;
        console.log('Creating whistle.mp3 sound');
      }
      
      // Preload the audio
      audio.preload = "auto";
      
      return audio;
    } catch (error) {
      console.error('Error creating audio:', error);
      return undefined;
    }
  }
}

export default AudioService;
