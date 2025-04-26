
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
    
    // iOS specific handling
    if (this.isIOSDevice) {
      await this.playIOSSound(type);
      return;
    }
    
    // Enhanced desktop sound playback with multiple fallback methods
    console.log(`Attempting to play ${type} sound on desktop using multiple methods`);
    
    // Always ensure whistleSound is loaded
    if (type === 'end') {
      this.whistleSound.load();
    }
    
    // Try Web Audio API first (most reliable)
    try {
      if (this.state.audioContext) {
        const buffer = type === 'start' ? this.state.startAudioBuffer : this.state.endAudioBuffer;
        if (buffer) {
          const source = this.state.audioContext.createBufferSource();
          source.buffer = buffer;
          source.connect(this.state.audioContext.destination);
          source.start(0);
          console.log(`${type} sound played using Web Audio API`);
          return; // Successfully played
        }
      }
    } catch (webAudioError) {
      console.warn(`Web Audio API playback failed for ${type} sound:`, webAudioError);
    }
    
    // Try new Audio element (second most reliable)
    try {
      const freshAudio = new Audio(type === 'start' ? this.audioConfig.startSoundPath : this.audioConfig.endSoundPath);
      freshAudio.volume = 1.0;
      await freshAudio.play();
      console.log(`${type} sound played using fresh HTML Audio element`);
      return; // Successfully played
    } catch (freshAudioError) {
      console.warn(`Fresh audio element failed for ${type} sound:`, freshAudioError);
    }
    
    // Try DOM audio element method (for browsers with strict autoplay policies)
    try {
      console.log(`Attempting DOM audio element for ${type} sound`);
      const emergencyAudio = document.createElement('audio');
      emergencyAudio.src = type === 'start' ? this.audioConfig.startSoundPath : this.audioConfig.endSoundPath;
      emergencyAudio.volume = 1.0;
      document.body.appendChild(emergencyAudio);
      
      await emergencyAudio.play();
      console.log(`${type} sound played using emergency audio element`);
      
      // Clean up the element after playback
      emergencyAudio.onended = () => {
        document.body.removeChild(emergencyAudio);
      };
      
      // Fallback cleanup
      setTimeout(() => {
        if (document.body.contains(emergencyAudio)) {
          document.body.removeChild(emergencyAudio);
        }
      }, 3000);
      
      return; // Successfully played
    } catch (domAudioError) {
      console.error(`DOM audio element failed for ${type} sound:`, domAudioError);
    }
    
    // Final attempt with original audio elements
    try {
      const audio = type === 'start' ? this.goSound : this.whistleSound;
      audio.currentTime = 0;
      audio.volume = 1.0;
      await audio.play();
      console.log(`${type} sound played using original HTML Audio element`);
      return; // Successfully played
    } catch (finalError) {
      console.error(`All attempts to play ${type} sound failed:`, finalError);
    }
  }
}

export default AudioService;
