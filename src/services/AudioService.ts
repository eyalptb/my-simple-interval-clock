
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
  private audioInitialized: boolean = false;

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

  // New method to initialize both sounds silently
  public async initializeSounds(): Promise<void> {
    if (this.audioInitialized) return;
    
    try {
      // Create separate temporary audio objects specifically for initialization
      const tempStart = new Audio(this.audioConfig.startSoundPath);
      const tempEnd = new Audio(this.audioConfig.endSoundPath);
      
      // Set to silent
      tempStart.volume = 0;
      tempEnd.volume = 0;
      
      // Try to play both sounds silently and catch any errors
      await Promise.all([
        tempStart.play().catch(() => {}),
        tempEnd.play().catch(() => {})
      ]);
      
      // Stop them immediately
      setTimeout(() => {
        tempStart.pause();
        tempEnd.pause();
        tempStart.currentTime = 0;
        tempEnd.currentTime = 0;
      }, 50);
      
      // Mark as initialized
      this.audioInitialized = true;
      console.log('Audio service: Both sounds pre-initialized');
    } catch (error) {
      console.log('Audio initialization attempt complete');
    }
  }

  public async playSound(type: 'start' | 'end'): Promise<void> {
    try {
      const audio = type === 'start' ? this.goSound : this.whistleSound;
      
      // Reset and play
      audio.currentTime = 0;
      
      // Try to play with a more robust approach
      try {
        // First, try the standard play method
        await audio.play().catch(async (error) => {
          console.warn(`First play attempt for ${type} sound failed, trying alternative approach:`, error);
          
          // On failure, create a new instance
          const newAudio = new Audio(type === 'start' ? this.audioConfig.startSoundPath : this.audioConfig.endSoundPath);
          newAudio.volume = audio.volume;
          
          // Try to play with the new instance
          await newAudio.play().catch(secondError => {
            console.error(`Second play attempt for ${type} sound failed:`, secondError);
            toast({
              title: 'Audio Playback Notice',
              description: `Please tap or click the screen once to enable sound for ${type === 'start' ? 'start' : 'end'} sound.`,
              variant: 'default'
            });
          });
          
          // If we got here without throwing, update our reference
          if (type === 'start') {
            this.goSound = newAudio;
          } else {
            this.whistleSound = newAudio;
          }
        });
        
        console.log(`${type} sound played successfully`);
      } catch (finalError) {
        console.error(`All play attempts for ${type} sound failed:`, finalError);
      }
    } catch (error) {
      console.error(`Unexpected error playing ${type} sound:`, error);
    }
  }
}

export default AudioService;
