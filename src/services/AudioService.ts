
import goMp3 from '@/assets/audio/go.mp3';
import whistleMp3 from '@/assets/audio/whistle.mp3';
import { AudioConfig, AudioState } from '@/types/audio';
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

  private async loadAudioBuffer(url: string, type: 'start' | 'end'): Promise<void> {
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

  private async playIOSSound(sound: HTMLAudioElement): Promise<void> {
    if (!this.iOSHandler.canPlaySound()) {
      return;
    }
    
    this.iOSHandler.updateLastPlayAttempt();
    
    const newSound = createAudioElement(
      sound === this.goSound ? this.audioConfig.startSoundPath : this.audioConfig.endSoundPath
    );
    
    try {
      newSound.currentTime = 0;
      await newSound.play();
    } catch (error) {
      console.error('iOS play attempt failed:', error);
    }
  }

  public blockSoundsTemporarily(durationMs: number = 2500): void {
    this.iOSHandler.blockSounds(durationMs);
  }

  public async playSound(type: 'start' | 'end'): Promise<void> {
    if (!this.iOSHandler.canPlaySound()) {
      return;
    }
    
    await this.initializeAudioContext();
    
    try {
      if (this.state.isIOS) {
        const sound = type === 'start' ? this.goSound : this.whistleSound;
        await this.playIOSSound(sound);
        console.log(`${type} sound played using iOS specific method`);
        return;
      }
      
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
