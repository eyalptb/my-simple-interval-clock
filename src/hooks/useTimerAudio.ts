
import { useEffect, useRef, useCallback } from 'react';
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
  
  const audioService = AudioService.getInstance();

  // Initialize the audio on component mount
  useEffect(() => {
    // Create audio elements
    audioStore.current.startSound = audioService.createAudio('start');
    audioStore.current.endSound = audioService.createAudio('end');
    
    console.log('Audio files initialized in useTimerAudio');

    // Cleanup function
    return () => {
      if (audioStore.current.startSound) {
        audioStore.current.startSound.pause();
      }
      if (audioStore.current.endSound) {
        audioStore.current.endSound.pause();
      }
    };
  }, []);

  const playSound = useCallback(async (type: 'start' | 'end') => {
    if (isMuted) {
      console.log('Audio is muted, not playing sound');
      return;
    }
    
    try {
      // Use the singleton AudioService to play sounds
      await audioService.playSound(type);
      audioStore.current.attemptedToPlay = true;
    } catch (error) {
      console.error(`Error in useTimerAudio playing ${type} sound:`, error);
      
      if (!audioStore.current.attemptedToPlay) {
        toast({
          title: 'Audio Notice',
          description: 'Please interact with the page to enable sound playback.',
          variant: 'default'
        });
        audioStore.current.attemptedToPlay = true;
      }
    }
  }, [isMuted]);

  return {
    playStartSound: () => playSound('start'),
    playEndSound: () => playSound('end'),
    audioStore
  };
};
