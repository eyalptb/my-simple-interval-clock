
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
  
  private startAudio: HTMLAudioElement | null = null;
  private endAudio: HTMLAudioElement | null = null;

  private constructor() {
    this.initializeAudio();
  }

  private initializeAudio(): void {
    try {
      this.startAudio = new Audio(this.audioConfig.startSoundPath);
      this.endAudio = new Audio(this.audioConfig.endSoundPath);
      
      // Preload audio files
      this.startAudio.preload = "auto";
      this.endAudio.preload = "auto";
      
      console.log('Audio initialized successfully');
    } catch (error) {
      console.error('Failed to initialize audio:', error);
    }
  }

  public static getInstance(): AudioService {
    if (!AudioService.instance) {
      AudioService.instance = new AudioService();
    }
    return AudioService.instance;
  }

  public async playSound(type: 'start' | 'end'): Promise<void> {
    // We'll use a more direct and forceful approach to play audio
    try {
      // Create a fresh instance every time to avoid any playback issues
      const audio = new Audio(type === 'start' ? 
        this.audioConfig.startSoundPath : 
        this.audioConfig.endSoundPath
      );
      
      // Set volume to maximum to ensure it's audible
      audio.volume = 1.0;
      
      console.log(`Playing ${type} sound`);
      
      // Try to play the sound multiple times if needed
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.error(`Error playing ${type} sound:`, error);
          // Try again with user interaction simulation
          document.addEventListener('click', () => {
            audio.play().catch(e => console.error('Second attempt failed:', e));
          }, { once: true });
        });
      }
    } catch (error) {
      console.error(`Error playing ${type} sound:`, error);
    }
  }
  
  public createAudio(type: 'start' | 'end'): HTMLAudioElement {
    const audio = new Audio();
    
    if (type === 'start') {
      audio.src = this.audioConfig.startSoundPath;
    } else {
      audio.src = this.audioConfig.endSoundPath;
    }
    
    // Set maximum volume
    audio.volume = 1.0;
    
    // Preload the audio
    audio.preload = "auto";
    
    return audio;
  }
}

export default AudioService;
