
import { useEffect, useRef } from 'react';
import { toast } from '@/hooks/use-toast';

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
    
    startSound.src = '/audio/go.mp3';
    endSound.src = '/audio/whistle.mp3';
    
    startSound.onerror = () => {
      if (audioStore.current.attemptedToPlay) {
        console.error('Failed to load start sound');
        toast({
          title: 'Audio Error',
          description: 'Could not load start sound',
          variant: 'destructive'
        });
      }
    };

    endSound.onerror = () => {
      if (audioStore.current.attemptedToPlay) {
        console.error('Failed to load end sound');
        toast({
          title: 'Audio Error',
          description: 'Could not load end sound',
          variant: 'destructive'
        });
      }
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
