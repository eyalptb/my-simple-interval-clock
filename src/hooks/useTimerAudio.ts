
import { useEffect, useRef, useCallback } from 'react';
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

    // Auto-play a silent sound to unlock audio on iOS
    const unlockAudio = () => {
      const silentSound = new Audio("data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA/+M4wAAAAAAAAAAAAEluZm8AAAAPAAAAAwAAAJbvABgAABQgGB0REREZGRkfHx8mJiYtLS0zMzM6Ojo/Pz9GRkZNTU1TU1NaWlpgYGBoaGhvb293d3d+fn6EhISKioqSkpKYmJienp6lpaWrq6uxsbG5ubm/v7/FxcXLy8vS0tLY2Nje3t7l5eXr6+vx8fH4+Pj+/v7///8AAAA5TEFNRTMuMTAwAUEAALYgJALkTYAAAA4AA5wBAOgYQD/+M4wC4PHYAQMQAAAP8ZJDkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk/+MYxA8AAANIAAAAABYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhY/+MYxBoFEANYAUwAAFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhY");
      silentSound.play().catch(() => {});
    };
    
    // Attempt to unlock audio API
    document.addEventListener('touchstart', unlockAudio, { once: true });
    document.addEventListener('click', unlockAudio, { once: true });
    
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
    }
  }, [isMuted]);

  return {
    playStartSound: () => playSound('start'),
    playEndSound: () => playSound('end'),
    audioStore
  };
};
