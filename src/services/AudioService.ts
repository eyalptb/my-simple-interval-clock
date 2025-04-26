
interface AudioConfig {
  startSoundPath: string;
  endSoundPath: string;
}

class AudioService {
  private static instance: AudioService;
  private audioConfig: AudioConfig = {
    startSoundPath: '/audio/go.mp3',
    endSoundPath: '/audio/whistle.mp3'
  };
  
  private goSound: HTMLAudioElement;
  private whistleSound: HTMLAudioElement;

  private constructor() {
    this.goSound = new Audio(this.audioConfig.startSoundPath);
    this.whistleSound = new Audio(this.audioConfig.endSoundPath);
    
    // Preload audio files
    this.goSound.preload = "auto";
    this.whistleSound.preload = "auto";
    
    // Set maximum volume
    this.goSound.volume = 1.0;
    this.whistleSound.volume = 1.0;
    
    console.log('Audio Service initialized');
  }

  public static getInstance(): AudioService {
    if (!AudioService.instance) {
      AudioService.instance = new AudioService();
    }
    return AudioService.instance;
  }

  public async playSound(type: 'start' | 'end'): Promise<void> {
    try {
      const audio = type === 'start' ? this.goSound : this.whistleSound;
      
      // Reset the audio to start
      audio.currentTime = 0;
      
      console.log(`Playing ${type} sound`);
      const playPromise = audio.play();
      
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.error(`Error playing ${type} sound:`, error);
          // Create a fresh instance as fallback
          const newAudio = new Audio(type === 'start' ? this.audioConfig.startSoundPath : this.audioConfig.endSoundPath);
          newAudio.volume = 1.0;
          return newAudio.play();
        });
      }
    } catch (error) {
      console.error(`Error in AudioService playing ${type} sound:`, error);
    }
  }
}

export default AudioService;

