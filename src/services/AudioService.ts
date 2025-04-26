
import goMp3 from '@/assets/audio/go.mp3';
import whistleMp3 from '@/assets/audio/whistle.mp3';
import { AudioConfig, AudioState, SoundType } from '@/types/audio';
import { createAudioElement, initializeWebAudio } from '@/utils/audioInitializer';
import { IOSAudioHandler } from '@/utils/iOSAudioHandler';
import { loadAudioBuffer } from '@/utils/audioBufferLoader';

class AudioService {
  private static instance: AudioService;
  private audioConfig: AudioConfig = {
    startSoundPath: goMp3,
    endSoundPath: whistleMp3
  };
  
  private goSound: HTMLAudioElement;
  private whistleSound: HTMLAudioElement;
  private state: AudioState;
  private iOSHandler: IOSAudioHandler;
  private globalMute: boolean = false;
  private isResetOperation: boolean = false;
  private isIOSDevice: boolean;

  private constructor() {
    this.isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent);
    
    this.state = {
      audioInitialized: false,
      audioContext: null,
      startAudioBuffer: null,
      endAudioBuffer: null,
      lastIOSPlayAttempt: 0,
      soundBlockedUntil: 0,
      isIOS: this.isIOSDevice
    };
    
    this.iOSHandler = new IOSAudioHandler();
    this.goSound = createAudioElement(this.audioConfig.startSoundPath);
    this.whistleSound = createAudioElement(this.audioConfig.endSoundPath);
    this.state.audioContext = initializeWebAudio();
    
    console.log(`AudioService initialized, iOS: ${this.isIOSDevice}`);
  }

  public static getInstance(): AudioService {
    if (!AudioService.instance) {
      AudioService.instance = new AudioService();
    }
    return AudioService.instance;
  }

  public async initializeAudioContext(): Promise<void> {
    if (!this.state.audioContext) {
      this.state.audioContext = initializeWebAudio();
      if (!this.state.audioContext) return;
    }
    
    if (this.state.audioContext.state === 'suspended') {
      try {
        await this.state.audioContext.resume();
        console.log('Audio context resumed successfully');
      } catch (e) {
        console.error('Failed to resume audio context:', e);
      }
    }
    
    if (!this.state.startAudioBuffer) {
      this.loadAudioBuffer(this.audioConfig.startSoundPath, 'start');
    }
    if (!this.state.endAudioBuffer) {
      this.loadAudioBuffer(this.audioConfig.endSoundPath, 'end');
    }
  }

  private async loadAudioBuffer(url: string, type: SoundType): Promise<void> {
    if (!this.state.audioContext) return;
    
    try {
      const buffer = await loadAudioBuffer(this.state.audioContext, url);
      if (type === 'start') {
        this.state.startAudioBuffer = buffer;
      } else {
        this.state.endAudioBuffer = buffer;
      }
      console.log(`${type} sound buffer loaded`);
    } catch (error) {
      console.error(`Error loading ${type} sound buffer:`, error);
    }
  }

  public async initializeSounds(): Promise<void> {
    if (this.state.audioInitialized) return;
    
    try {
      await this.initializeAudioContext();
      
      const tempStart = createAudioElement(this.audioConfig.startSoundPath);
      const tempEnd = createAudioElement(this.audioConfig.endSoundPath);
      
      tempStart.volume = 0;
      tempEnd.volume = 0;
      
      await Promise.all([
        tempStart.play().catch(() => {}),
        tempEnd.play().catch(() => {})
      ]);
      
      setTimeout(() => {
        tempStart.pause();
        tempEnd.pause();
        tempStart.currentTime = 0;
        tempEnd.currentTime = 0;
      }, 50);
      
      this.state.audioInitialized = true;
      console.log('Audio service: Both sounds pre-initialized');
    } catch (error) {
      console.log('Audio initialization attempt complete');
    }
  }

  // Dedicated iOS sound player
  private async playIOSSound(type: SoundType): Promise<void> {
    // Special iOS sound permission check
    if (!this.iOSHandler.canPlaySound(type)) {
      console.log(`iOS: ${type} sound blocked by handler`);
      return;
    }
    
    // Update handler timestamps
    this.iOSHandler.updateLastPlayAttempt();
    
    // For iOS, we need new audio elements each time
    const newSound = createAudioElement(
      type === 'start' ? this.audioConfig.startSoundPath : this.audioConfig.endSoundPath
    );
    
    try {
      newSound.currentTime = 0;
      await newSound.play();
      
      // Mark start sound as played
      if (type === 'start') {
        this.iOSHandler.markStartSoundPlayed();
        console.log('iOS start sound played and marked');
      }
      
      console.log(`iOS: ${type} sound played successfully`);
    } catch (error) {
      console.error(`iOS ${type} sound play failed:`, error);
    }
  }

  // Register a reset operation to prevent sounds
  public registerReset(): void {
    this.isResetOperation = true;
    
    // Use iOS handler to block sounds more aggressively
    if (this.isIOSDevice) {
      this.iOSHandler.registerResetPress();
      this.iOSHandler.setGlobalSoundBlock(true);
      
      // Release the complete block after a delay
      setTimeout(() => {
        this.iOSHandler.setGlobalSoundBlock(false);
      }, 10000);
    }
    
    console.log('Reset operation registered - sounds blocked');
    
    // Auto-clear reset state after a delay
    setTimeout(() => {
      this.isResetOperation = false;
      console.log('Reset operation cleared');
    }, 30000); // 30 seconds
  }

  // Register a plus button press to track potential abuse
  public registerPlusButtonPress(): void {
    if (this.isIOSDevice) {
      this.iOSHandler.registerPlusButtonPress();
    }
  }

  // Set global mute state
  public setMute(muted: boolean): void {
    this.globalMute = muted;
    console.log(`Global audio mute set to: ${muted}`);
  }

  // Check if we can play sounds at all
  private canPlaySounds(): boolean {
    if (this.globalMute) {
      return false;
    }
    
    if (this.isResetOperation) {
      return false;
    }
    
    return true;
  }

  // Called at timer start - ensures iOS can play start sound
  public prepareStartSound(): void {
    if (this.isIOSDevice) {
      // Reset the start sound played state to allow it to play
      this.iOSHandler.resetStartSoundStatus();
      console.log('iOS start sound prepared for playback');
    }
  }

  // Main sound playing method
  public async playSound(type: SoundType): Promise<void> {
    // Global checks first
    if (!this.canPlaySounds()) {
      console.log(`${type} sound blocked - global restriction`);
      return;
    }
    
    await this.initializeAudioContext();
    
    // Special iOS handling
    if (this.isIOSDevice) {
      await this.playIOSSound(type);
      return;
    }
    
    // Regular devices with Web Audio API
    try {
      if (this.state.audioContext && 
          ((type === 'start' && this.state.startAudioBuffer) || 
           (type === 'end' && this.state.endAudioBuffer))) {
        
        const buffer = type === 'start' ? this.state.startAudioBuffer : this.state.endAudioBuffer;
        if (buffer) {
          const source = this.state.audioContext.createBufferSource();
          source.buffer = buffer;
          source.connect(this.state.audioContext.destination);
          source.start(0);
          console.log(`${type} sound played using Web Audio API`);
          return;
        }
      }
      
      // Fallback to HTML Audio
      const audio = type === 'start' ? this.goSound : this.whistleSound;
      audio.currentTime = 0;
      await audio.play();
      console.log(`${type} sound played using HTML Audio`);
    } catch (error) {
      console.error(`Error playing ${type} sound:`, error);
    }
  }
}

export default AudioService;
