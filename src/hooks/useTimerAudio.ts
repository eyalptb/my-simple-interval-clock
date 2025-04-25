
import { useEffect, useRef } from 'react';
import { toast } from '@/hooks/use-toast';

interface AudioStore {
  startSound: HTMLAudioElement | undefined;
  endSound: HTMLAudioElement | undefined;
  attemptedToPlay: boolean;
}

const DEFAULT_BEEP = 'data:audio/wav;base64,//uQRAAAAWMQ++QAAAABmhf5nWAEuNUHNn9zCwAARQ2cDHmwhT5g/QAAAABMFV//6O///AAAADhQAAQAA//7gABDhX4CAAPAA//4sABDwsAEALP//AAAAADAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA==';

const handleAudioError = (soundType: 'start' | 'end', audio: HTMLAudioElement) => {
  console.warn(`Failed to load ${soundType} sound. Using default beep.`);
  toast({
    title: 'Audio Warning',
    description: `Could not load ${soundType} sound. Using default audio.`,
    variant: 'default'
  });
  audio.src = DEFAULT_BEEP;
};

export const useTimerAudio = (isMuted: boolean) => {
  const audioStore = useRef<AudioStore>({
    startSound: undefined,
    endSound: undefined,
    attemptedToPlay: false
  });

  useEffect(() => {
    const startSound = new Audio();
    const endSound = new Audio();
    
    startSound.src = '/src/assets/audio/go.mp3';
    endSound.src = '/src/assets/audio/whistle.mp3';
    
    startSound.onerror = () => handleAudioError('start', startSound);
    endSound.onerror = () => handleAudioError('end', endSound);
    
    audioStore.current = {
      startSound,
      endSound,
      attemptedToPlay: false
    };

    startSound.load();
    endSound.load();

    return () => {
      startSound.pause();
      endSound.pause();
    };
  }, []);

  const playSound = (type: 'start' | 'end') => {
    if (isMuted) return;
    
    const sound = type === 'start' ? 
      audioStore.current.startSound : 
      audioStore.current.endSound;

    if (sound) {
      sound.currentTime = 0;
      audioStore.current.attemptedToPlay = true;
      sound.play().catch(e => console.error(`Error playing ${type} sound:`, e));
    }
  };

  return {
    playStartSound: () => playSound('start'),
    playEndSound: () => playSound('end'),
    audioStore,
  };
};
