
import { toast } from '@/hooks/use-toast';
import goMp3 from '@/assets/audio/go.mp3';
import whistleMp3 from '@/assets/audio/whistle.mp3';

interface AudioConfig {
  startSoundPath: string;
  endSoundPath: string;
}

class AudioService {
  private static instance: AudioService;
  private audioConfig: AudioConfig = {
    startSoundPath: goMp3,
    endSoundPath: whistleMp3
  };
  
  private goSound: HTMLAudioElement;
  private whistleSound: HTMLAudioElement;

  private constructor() {
    this.goSound = new Audio(this.audioConfig.startSoundPath);
    this.whistleSound = new Audio(this.audioConfig.endSoundPath);
    
    this.setupAudioElement(this.goSound, 'start');
    this.setupAudioElement(this.whistleSound, 'end');
    
    console.log('Audio Service initialized with paths:', this.audioConfig);
  }

  private setupAudioElement(audio: HTMLAudioElement, type: 'start' | 'end') {
    audio.preload = 'auto';
    audio.volume = 1.0;
    
    // Add error handlers
    audio.onerror = (e) => {
      console.error(`Error loading ${type} sound:`, e);
      toast({
        title: 'Audio Error',
        description: `Could not load ${type} sound. Please check the file path: ${audio.src}`,
        variant: 'destructive'
      });
    };
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
      
      // Reset and play
      audio.currentTime = 0;
      await audio.play().catch(error => {
        console.error(`Play ${type} sound error:`, error);
        toast({
          title: 'Audio Playback Error',
          description: `Could not play ${type} sound. Try interacting with the page first.`,
          variant: 'destructive'
        });
      });
    } catch (error) {
      console.error(`Unexpected error playing ${type} sound:`, error);
    }
  }
}

export default AudioService;
