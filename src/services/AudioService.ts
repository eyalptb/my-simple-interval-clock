
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
  private isIOS: boolean = false;

  // Add specific prevention for iOS rapid button presses
  private lastIOSPlayAttempt: number = 0;
  private soundBlockedUntil: number = 0;

  private constructor() {
    // Check if running on iOS
    this.isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    
    // Create audio elements
    this.goSound = new Audio(this.audioConfig.startSoundPath);
    this.whistleSound = new Audio(this.audioConfig.endSoundPath);
    
    this.setupAudioElement(this.goSound);
    this.setupAudioElement(this.whistleSound);
    
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

  private setupAudioElement(audio: HTMLAudioElement) {
    audio.preload = 'auto';
    audio.volume = 1.0;
    
    // Add minimal error handling without notifications
    audio.onerror = (e) => {
      console.error(`Error loading sound:`, e);
    };
  }

  public static getInstance(): AudioService {
    if (!AudioService.instance) {
      AudioService.instance = new AudioService();
    }
    return AudioService.instance;
  }

  // Initialize audio context and load buffers
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

  // Initialize both sounds silently for iOS
  public async initializeSounds(): Promise<void> {
    if (this.audioInitialized) return;
    
    try {
      // Initialize Web Audio API
      await this.initializeAudioContext();
      
      // Create silent temporary audio objects for initialization
      const tempStart = new Audio(this.audioConfig.startSoundPath);
      const tempEnd = new Audio(this.audioConfig.endSoundPath);
      
      // Set to silent
      tempStart.volume = 0;
      tempEnd.volume = 0;
      
      // Try to play both sounds silently and catch errors silently
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
      
      this.audioInitialized = true;
      console.log('Audio service: Both sounds pre-initialized');
    } catch (error) {
      console.log('Audio initialization attempt complete');
    }
  }

  // iOS-specific play method with enhanced iOS compatibility
  private async playIOSSound(sound: HTMLAudioElement): Promise<void> {
    // iOS-specific reset state handling - PROTECT AGAINST RAPID PRESSES
    const now = Date.now();
    
    // Block sounds if we are in a reset/blocked period
    if (now < this.soundBlockedUntil) {
      console.log('iOS: Sound blocked due to recent reset');
      return;
    }
    
    // Prevent multiple requests for iOS
    if (now - this.lastIOSPlayAttempt < 1200) {
      console.log('iOS: Sound prevented - too many rapid button presses');
      return;
    }
    
    this.lastIOSPlayAttempt = now;
    
    // For iOS, create a new audio element each time for better compatibility
    const newSound = new Audio(sound === this.goSound ? 
                               this.audioConfig.startSoundPath : 
                               this.audioConfig.endSoundPath);
    
    try {
      // Always set current time to 0 for iOS
      newSound.currentTime = 0;
      await newSound.play();
    } catch (error) {
      console.error('iOS play attempt failed:', error);
    }
  }

  // Method to explicitly block sounds (can be called externally)
  public blockSoundsTemporarily(durationMs: number = 2500): void {
    this.soundBlockedUntil = Date.now() + durationMs;
    console.log(`Sounds blocked for ${durationMs}ms from AudioService level`);
  }

  // Main play sound method with better iOS handling
  public async playSound(type: 'start' | 'end'): Promise<void> {
    // Check if we're in a sound blocked period (reset protection)
    const now = Date.now();
    if (now < this.soundBlockedUntil) {
      console.log(`Sound play attempt (${type}) blocked - in cooldown period`);
      return;
    }
    
    // Prevent both sounds from playing at once - INCREASED FROM 500ms to 1200ms
    if (this._lastPlayedTime && now - this._lastPlayedTime < 1200) {
      console.log('Skipping sound playback - too close to previous sound');
      return;
    }
    this._lastPlayedTime = now;
    
    // Ensure audio context is ready
    await this.initializeAudioContext();
    
    try {
      // Special handling for iOS
      if (this.isIOS) {
        const sound = type === 'start' ? this.goSound : this.whistleSound;
        await this.playIOSSound(sound);
        console.log(`${type} sound played using iOS specific method`);
        return;
      }
      
      // Try Web Audio API first if available
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
      audio.currentTime = 0;
      
      await audio.play().catch(async () => {
        console.warn(`Play attempt for ${type} sound failed, trying alternative`);
        
        // Create a new audio instance on failure
        const newAudio = new Audio(type === 'start' ? 
                                   this.audioConfig.startSoundPath : 
                                   this.audioConfig.endSoundPath);
        newAudio.volume = 1.0;
        
        await newAudio.play().catch(e => {
          console.error(`All play attempts for ${type} sound failed:`, e);
        });
        
        // Update reference if second attempt succeeded
        if (type === 'start') {
          this.goSound = newAudio;
        } else {
          this.whistleSound = newAudio;
        }
      });
      
      console.log(`${type} sound played successfully`);
    } catch (error) {
      console.error(`Unexpected error playing ${type} sound:`, error);
    }
  }
  
  // Track last played sound to prevent overlapping
  private _lastPlayedTime: number = 0;
}

export default AudioService;
