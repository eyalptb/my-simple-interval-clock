
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
      
      // Get the base URL dynamically
      const baseUrl = window.location.origin;
      
      if (type === 'start') {
        audio.src = `${baseUrl}${this.audioConfig.startSoundPath}`;
        console.log('Creating start sound with path:', audio.src);
      } else {
        audio.src = `${baseUrl}${this.audioConfig.endSoundPath}`;
        console.log('Creating end sound with path:', audio.src);
      }
      
      // Preload the audio
      audio.preload = "auto";
      
      // Add error handler for debugging
      audio.onerror = (e) => {
        console.error('Audio error:', e);
        console.error('Audio error code:', (audio as any).error?.code);
        console.error('Audio error message:', (audio as any).error?.message);
      };
      
      return audio;
    } catch (error) {
      console.error('Error creating audio:', error);
      return undefined;
    }
  }
  
  public playTestSound(type: 'start' | 'end'): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const audio = this.createAudio(type);
        if (!audio) {
          return reject('Could not create audio element');
        }
        
        // Set up event listeners
        audio.addEventListener('ended', () => resolve());
        audio.addEventListener('error', (e) => reject(e));
        
        // Try to play
        const playPromise = audio.play();
        
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.warn(`Test playback failed for ${type} sound:`, error);
            reject(error);
          });
        }
      } catch (error) {
        console.error('Error in playTestSound:', error);
        reject(error);
      }
    });
  }
}

export default AudioService;
