
interface AudioConfig {
  startSoundPath: string;
  endSoundPath: string;
  defaultBeep: string;
}

class AudioService {
  private static instance: AudioService;
  private audioConfig: AudioConfig = {
    startSoundPath: '/src/assets/audio/go.mp3',
    endSoundPath: '/src/assets/audio/whistle.mp3',
    defaultBeep: 'data:audio/wav;base64,//uQRAAAAWMQ++QAAAABmhf5nWAEuNUHNn9zCwAARQ2cDHmwhT5g/QAAAABMFV//6O///AAAADhQAAQAA//7gABDhX4CAAPAA//4sABDwsAEALP//AAAAADAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA==',
  };

  private constructor() {}

  public static getInstance(): AudioService {
    if (!AudioService.instance) {
      AudioService.instance = new AudioService();
    }
    return AudioService.instance;
  }

  public createAudio(type: 'start' | 'end'): HTMLAudioElement {
    const audio = new Audio();
    audio.src = type === 'start' ? 
      this.audioConfig.startSoundPath : 
      this.audioConfig.endSoundPath;
    
    audio.onerror = () => this.handleAudioError(type, audio);
    audio.load();
    
    return audio;
  }

  private handleAudioError(type: 'start' | 'end', audio: HTMLAudioElement): void {
    console.warn(`Failed to load ${type} sound. Using default beep.`);
    audio.src = this.audioConfig.defaultBeep;
  }
}

export default AudioService;
