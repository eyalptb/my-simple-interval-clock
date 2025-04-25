import { useEffect, useRef } from 'react';
import { toast } from '@/hooks/use-toast';
import goSoundPath from '@/assets/audio/go.mp3';
import whistleSoundPath from '@/assets/audio/whistle.mp3';

interface AudioStore {
  startSound?: HTMLAudioElement;
  endSound?: HTMLAudioElement;
  attemptedToPlay?: boolean;
}

export const useTimerAudio = (isMuted: boolean) => {
  const audioStore = useRef<AudioStore>({});

  useEffect(() => {
    const startSound = new Audio();
    const endSound = new Audio();
    
    // Use the imported paths
    startSound.src = goSoundPath;
    endSound.src = whistleSoundPath;
    
    startSound.onerror = () => {
      console.warn('Failed to load start sound. Using default beep.');
      toast({
        title: 'Audio Warning',
        description: 'Could not load start sound. Using default audio.',
        variant: 'default'
      });
      startSound.src = 'data:audio/wav;base64,//uQRAAAAWMQ++QAAAABmhf5nWAEuNUHNn9zCwAARQ2cDHmwhT5g/QAAAABMFV//6O///AAAADhQAAQAA//7gABDhX4CAAPAA//4sABDwsAEALP//AAAAADAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA==';
    };

    endSound.onerror = () => {
      console.warn('Failed to load end sound. Using default beep.');
      toast({
        title: 'Audio Warning',
        description: 'Could not load end sound. Using default audio.',
        variant: 'default'
      });
      endSound.src = 'data:audio/wav;base64,//uQRAAAAWMQ++QAAAABmhf5nWAEuNUHNn9zCwAARQ2cDHmwhT5g/QAAAABMFV//6O///AAAADhQAAQAA//7gABDhX4CAAPAA//4sABDwsAEALP//AAAAADAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA//8AAKAA==';
    };
    
    audioStore.current.attemptedToPlay = false;
    startSound.load();
    endSound.load();
    
    audioStore.current.startSound = startSound;
    audioStore.current.endSound = endSound;
  }, []);

  const playStartSound = () => {
    if (!isMuted) {
      const startSound = audioStore.current.startSound;
      if (startSound) {
        startSound.currentTime = 0;
        audioStore.current.attemptedToPlay = true;
        startSound.play().catch(e => console.error('Error playing start sound:', e));
      }
    }
  };

  const playEndSound = () => {
    if (!isMuted) {
      const endSound = audioStore.current.endSound;
      if (endSound) {
        endSound.currentTime = 0;
        audioStore.current.attemptedToPlay = true;
        endSound.play().catch(e => console.error('Error playing end sound:', e));
      }
    }
  };

  return {
    playStartSound,
    playEndSound,
    audioStore,
  };
};
