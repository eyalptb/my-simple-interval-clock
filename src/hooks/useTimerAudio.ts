
import { useEffect, useRef } from 'react';
import { toast } from '@/hooks/use-toast';
import AudioService from '@/services/AudioService';

interface AudioStore {
  startSound: HTMLAudioElement | undefined;
  endSound: HTMLAudioElement | undefined;
  attemptedToPlay: boolean;
}

export const useTimerAudio = (isMuted: boolean) => {
  const audioStore = useRef<AudioStore>({
    startSound: undefined,
    endSound: undefined,
    attemptedToPlay: false
  });

  useEffect(() => {
    const audioService = AudioService.getInstance();
    
    audioStore.current = {
      startSound: audioService.createAudio('start'),
      endSound: audioService.createAudio('end'),
      attemptedToPlay: false
    };

    return () => {
      if (audioStore.current.startSound) audioStore.current.startSound.pause();
      if (audioStore.current.endSound) audioStore.current.endSound.pause();
    };
  }, []);

  const playSound = async (type: 'start' | 'end') => {
    if (isMuted) return;
    
    const sound = type === 'start' ? 
      audioStore.current.startSound : 
      audioStore.current.endSound;

    if (sound) {
      try {
        sound.currentTime = 0;
        audioStore.current.attemptedToPlay = true;
        await sound.play();
      } catch (error) {
        console.error(`Error playing ${type} sound:`, error);
        toast({
          title: 'Audio Error',
          description: `Unable to play ${type} sound. Please check your audio settings.`,
          variant: 'destructive'
        });
      }
    }
  };

  return {
    playStartSound: () => playSound('start'),
    playEndSound: () => playSound('end'),
    audioStore,
  };
};
