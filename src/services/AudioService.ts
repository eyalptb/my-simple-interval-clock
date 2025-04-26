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
  private globalSoundEnabled: boolean = true;
  private lastResetTime: number = 0;
  private lastPlusButtonTime: number = 0;

  private constructor() {
    this.state = {
      audioInitialized: false,
      audioContext: null,
      startAudioBuffer: null,
      endAudioBuffer: null,
      lastIOSPlayAttempt: 0,
      soundBlockedUntil: 0,
      isIOS: /iPad|iPhone|iPod/.test(navigator.userAgent)
    };
    
    this.iOSHandler = new IOSAudioHandler();
    this.goSound = createAudioElement(this.audioConfig.startSoundPath);
    this.whistleSound = createAudioElement(this.audioConfig.endSoundPath);
    this.state.audioContext = initializeWebAudio();
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

  private async playIOSSound(type: SoundType): Promise<void> {
    if (!this.iOSHandler.canPlaySound(type)) {
      console.log(`iOS: ${type} sound blocked by handler`);
      return;
    }
    
    this.iOSHandler.updateLastPlayAttempt();
    
    const newSound = createAudioElement(
      type === 'start' ? this.audioConfig.startSoundPath : this.audioConfig.endSoundPath
    );
    
    try {
      newSound.currentTime = 0;
      await newSound.play();
      
      // Mark this specific sound type as played
      this.iOSHandler.setIOSSoundPlayed(type, true);
      console.log(`iOS: ${type} sound played and marked as played`);
    } catch (error) {
      console.error(`iOS ${type} play attempt failed:`, error);
    }
  }

  public blockSoundsTemporarily(durationMs: number = 15000): void {
    console.log(`Blocking sounds for ${durationMs}ms from AudioService level`);
    this.lastResetTime = Date.now();
    this.iOSHandler.blockSounds(durationMs);
    
    // Emergency override on reset to ensure absolutely no sounds play
    this.iOSHandler.forceBlockSounds(true);
    
    // Release the emergency block after a delay
    setTimeout(() => {
      this.iOSHandler.forceBlockSounds(false);
    }, 7000);
  }

  public trackPlusButtonPress(): void {
    const now = Date.now();
    this.lastPlusButtonTime = now;
    
    // If this is within 10 seconds of a reset, block start sound
    if (now - this.lastResetTime < 10000) {
      console.log('Plus button pressed shortly after reset - blocking start sound');
      this.iOSHandler.blockStartSound(15000);
      
      // Also force block for a short period
      this.iOSHandler.forceBlockSounds(true);
      setTimeout(() => {
        this.iOSHandler.forceBlockSounds(false);
      }, 5000);
    }
  }

  public disableAllSounds(): void {
    this.globalSoundEnabled = false;
    console.log('All sounds disabled globally');
  }

  public enableAllSounds(): void {
    this.globalSoundEnabled = true;
    console.log('All sounds enabled globally');
  }

  public resetIOSPlayedState(): void {
    // Don't reset too soon after a reset operation
    const timeSinceReset = Date.now() - this.lastResetTime;
    if (timeSinceReset < 10000) {
      console.log(`Ignoring resetIOSPlayedState - too soon after reset (${timeSinceReset}ms)`);
      return;
    }
    
    this.iOSHandler.resetIOSSoundPlayed();
  }

  public resetSpecificIOSSound(type: SoundType): void {
    // Don't reset too soon after a reset operation
    const timeSinceReset = Date.now() - this.lastResetTime;
    if (timeSinceReset < 10000) {
      console.log(`Ignoring reset of ${type} sound - too soon after reset (${timeSinceReset}ms)`);
      return;
    }
    
    this.iOSHandler.resetIOSSoundPlayed(type);
  }

  public isWithinResetCooldown(): boolean {
    return (Date.now() - this.lastResetTime) < 15000;
  }

  public async playSound(type: SoundType): Promise<void> {
    // First check global sound enabled flag
    if (!this.globalSoundEnabled) {
      console.log('Sound blocked: global sound disabled');
      return;
    }
    
    // Emergency check for reset cooldown
    if (this.isWithinResetCooldown()) {
      console.log(`${type} sound blocked - within reset cooldown period`);
      return;
    }
    
    // Check iOS handler permissions
    if (this.state.isIOS && !this.iOSHandler.canPlaySound(type)) {
      console.log(`${type} sound blocked by iOS handler with type-specific check`);
      return;
    }
    
    await this.initializeAudioContext();
    
    try {
      // Special handling for iOS devices
      if (this.state.isIOS) {
        await this.playIOSSound(type);
        return;
      }
      
      // Non-iOS devices use Web Audio API if available
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
      
      // Fallback to HTML Audio elements
      const audio = type === 'start' ? this.goSound : this.whistleSound;
      audio.currentTime = 0;
      
      await audio.play().catch(async () => {
        console.warn(`Play attempt for ${type} sound failed, trying alternative`);
        
        const newAudio = createAudioElement(
          type === 'start' ? this.audioConfig.startSoundPath : this.audioConfig.endSoundPath
        );
        
        await newAudio.play().catch(e => {
          console.error(`All play attempts for ${type} sound failed:`, e);
        });
        
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
}

export default AudioService;
