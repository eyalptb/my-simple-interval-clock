
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

  // Initialize the audio on component mount
  useEffect(() => {
    // Create audio elements
    const audioService = AudioService.getInstance();
    audioStore.current.startSound = new Audio('/assets/audio/go.mp3');
    audioStore.current.endSound = new Audio('/assets/audio/whistle.mp3');
    
    console.log('Audio files initialized');

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

  // Function to play a sound
  const playSound = async (type: 'start' | 'end') => {
    if (isMuted) {
      console.log('Audio is muted, not playing sound');
      return;
    }
    
    console.log(`Attempting to play ${type} sound...`);
    
    try {
      const sound = type === 'start' 
        ? new Audio('/assets/audio/go.mp3') 
        : new Audio('/assets/audio/whistle.mp3');
      
      console.log(`Playing ${type} sound...`);
      
      const playPromise = sound.play();
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log(`${type} sound played successfully`);
          })
          .catch(error => {
            console.error(`Error playing ${type} sound:`, error);
            
            // Show toast if there's an issue
            toast({
              title: 'Audio Notice',
              description: 'Please interact with the page to enable sound playback.',
              variant: 'default'
            });
          });
      }
    } catch (error) {
      console.error(`Error playing ${type} sound:`, error);
    }
  };

  return {
    playStartSound: () => playSound('start'),
    playEndSound: () => playSound('end'),
    audioStore
  };
};
