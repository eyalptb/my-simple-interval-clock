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

  private async playIOSSound(type: SoundType): Promise<void> {
    if (!this.iOSHandler.canPlayProgressSound(type)) {
      console.log(`iOS: ${type} sound blocked by handler`);
      return;
    }
    
    this.iOSHandler.updateLastProgressSoundAttempt();
    
    const newSound = createAudioElement(
      type === 'start' ? this.audioConfig.startSoundPath : this.audioConfig.endSoundPath
    );
    
    try {
      newSound.currentTime = 0;
      await newSound.play();
      
      if (type === 'start') {
        this.iOSHandler.markStartSoundPlayed();
        console.log('iOS start sound played and marked');
      }
      
      console.log(`iOS: ${type} sound played successfully`);
    } catch (error) {
      console.error(`iOS ${type} sound play failed:`, error);
    }
  }

  public registerReset(): void {
    if (this.isIOSDevice) {
      this.iOSHandler.registerResetPress();
    }
    
    console.log('Reset operation registered');
  }

  public setMute(muted: boolean): void {
    this.globalMute = muted;
    console.log(`Global audio mute set to: ${muted}`);
  }

  private canPlaySounds(): boolean {
    return !this.globalMute;
  }

  public prepareStartSound(): void {
    if (this.isIOSDevice) {
      this.iOSHandler.resetStartSoundStatus();
      console.log('iOS start sound prepared for playback');
    }
  }

  public async playSound(type: SoundType): Promise<void> {
    if (!this.canPlaySounds()) {
      console.log(`${type} sound blocked - muted`);
      return;
    }
    
    await this.initializeAudioContext();
    
    if (this.isIOSDevice) {
      await this.playIOSSound(type);
      return;
    }
    
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
      
      console.log(`Playing ${type} sound using HTML Audio`);
      const audio = type === 'start' ? this.goSound : this.whistleSound;
      audio.currentTime = 0;
      await audio.play();
      console.log(`${type} sound played successfully using HTML Audio`);
    } catch (error) {
      console.error(`Error playing ${type} sound:`, error);
      
      try {
        console.log(`Attempting recovery play for ${type} sound with fresh audio element`);
        const freshAudio = new Audio(type === 'start' ? this.audioConfig.startSoundPath : this.audioConfig.endSoundPath);
        freshAudio.volume = 1.0;
        await freshAudio.play();
        console.log(`${type} sound played using fresh HTML Audio element (recovery attempt)`);
      } catch (recoveryError) {
        console.error(`Final attempt to play ${type} sound failed:`, recoveryError);
      }
    }
  }
}

export default AudioService;
