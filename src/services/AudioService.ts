
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
  private audioContext: AudioContext | null = null;
  private startAudioBuffer: AudioBuffer | null = null;
  private endAudioBuffer: AudioBuffer | null = null;

  private constructor() {
    // Create audio elements
    this.goSound = new Audio(this.audioConfig.startSoundPath);
    this.whistleSound = new Audio(this.audioConfig.endSoundPath);
    
    this.setupAudioElement(this.goSound, 'start');
    this.setupAudioElement(this.whistleSound, 'end');
    
    // Try to initialize WebAudio API if available
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContext) {
        this.audioContext = new AudioContext();
        console.log('Audio Context created successfully');
      }
    } catch (e) {
      console.log('WebAudio API not supported, falling back to HTML Audio API');
    }
    
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

  // Improved method to initialize audio context and load buffers
  public async initializeAudioContext(): Promise<void> {
    if (!this.audioContext) {
      try {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        this.audioContext = new AudioContext();
        console.log('Audio Context initialized on user interaction');
      } catch (e) {
        console.error('Failed to create audio context:', e);
        return;
      }
    }
    
    // Resume audio context if suspended
    if (this.audioContext.state === 'suspended') {
      try {
        await this.audioContext.resume();
        console.log('Audio context resumed successfully');
      } catch (e) {
        console.error('Failed to resume audio context:', e);
      }
    }
    
    // Load audio buffers if not already loaded
    if (!this.startAudioBuffer) {
      this.loadAudioBuffer(this.audioConfig.startSoundPath, 'start');
    }
    
    if (!this.endAudioBuffer) {
      this.loadAudioBuffer(this.audioConfig.endSoundPath, 'end');
    }
  }
  
  private async loadAudioBuffer(url: string, type: 'start' | 'end'): Promise<void> {
    if (!this.audioContext) return;
    
    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      
      this.audioContext.decodeAudioData(
        arrayBuffer, 
        (buffer) => {
          if (type === 'start') {
            this.startAudioBuffer = buffer;
            console.log('Start sound buffer loaded');
          } else {
            this.endAudioBuffer = buffer;
            console.log('End sound buffer loaded');
          }
        },
        (error) => console.error(`Error decoding ${type} sound:`, error)
      );
    } catch (error) {
      console.error(`Error loading ${type} sound buffer:`, error);
    }
  }

  // New method to initialize both sounds silently
  public async initializeSounds(): Promise<void> {
    if (this.audioInitialized) return;
    
    try {
      // Try to initialize Web Audio API
      await this.initializeAudioContext();
      
      // Create separate temporary audio objects specifically for initialization
      const tempStart = new Audio(this.audioConfig.startSoundPath);
      const tempEnd = new Audio(this.audioConfig.endSoundPath);
      
      // Set to silent
      tempStart.volume = 0;
      tempEnd.volume = 0;
      
      // Try to play both sounds silently and catch any errors
      await Promise.all([
        tempStart.play().catch(() => {
          console.log('Silent start initialization - expected error on iOS');
        }),
        tempEnd.play().catch(() => {
          console.log('Silent end initialization - expected error on iOS');
        })
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
    // First, try to ensure audio context is ready
    await this.initializeAudioContext();
    
    try {
      // Try to play using Web Audio API first if available
      if (this.audioContext && 
          ((type === 'start' && this.startAudioBuffer) || 
           (type === 'end' && this.endAudioBuffer))) {
          
        const buffer = type === 'start' ? this.startAudioBuffer : this.endAudioBuffer;
        if (buffer) {
          const source = this.audioContext.createBufferSource();
          source.buffer = buffer;
          source.connect(this.audioContext.destination);
          source.start(0);
          console.log(`${type} sound played using Web Audio API`);
          return;
        }
      }
      
      // Fall back to HTML Audio API
      const audio = type === 'start' ? this.goSound : this.whistleSound;
      
      // Reset and prepare to play
      audio.currentTime = 0;
      
      // Try multiple play strategies
      try {
        // First attempt: standard play
        await audio.play().catch(async (error) => {
          console.warn(`First play attempt for ${type} sound failed, trying alternative:`, error);
          
          // Second attempt: create a new audio instance on failure
          const newAudio = new Audio(type === 'start' ? this.audioConfig.startSoundPath : this.audioConfig.endSoundPath);
          newAudio.volume = 1.0;
          
          await newAudio.play().catch(e => {
            // Last resort: show user a toast suggesting interaction
            console.error(`All play attempts for ${type} sound failed:`, e);
            
            // Only show toast for problematic devices
            const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
            if (isIOS) {
              toast({
                title: 'Audio Playback',
                description: `Tap anywhere on screen to enable ${type === 'start' ? 'start' : 'end'} sounds.`,
                duration: 3000,
              });
            }
          });
          
          // If second attempt succeeded, update our reference
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
