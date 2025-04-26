
import { useEffect, useRef, useCallback } from 'react';
import AudioService from '@/services/AudioService';

interface AudioStore {
  startSound: HTMLAudioElement | null;
  endSound: HTMLAudioElement | null;
  attemptedToPlay: boolean;
}

export const useTimerAudio = (isMuted: boolean) => {
  const audioStore = useRef<AudioStore>({
    startSound: null,
    endSound: null,
    attemptedToPlay: false
  });
  
  const audioService = AudioService.getInstance();

  // Initialize the audio on component mount
  useEffect(() => {
    // Create audio elements
    if (!audioStore.current.startSound) {
      audioStore.current.startSound = new Audio('/audio/go.mp3');
      audioStore.current.startSound.volume = 1.0;
      audioStore.current.startSound.preload = "auto";
    }
    
    if (!audioStore.current.endSound) {
      audioStore.current.endSound = new Audio('/audio/whistle.mp3');
      audioStore.current.endSound.volume = 1.0;
      audioStore.current.endSound.preload = "auto";
    }
    
    console.log('Audio files initialized in useTimerAudio');

    // Auto-play a silent sound to unlock audio on iOS
    const unlockAudio = () => {
      const silentSound = new Audio("data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA/+M4wAAAAAAAAAAAAEluZm8AAAAPAAAAAwAAAJbvABgAABQgGB0REREZGRkfHx8mJiYtLS0zMzM6Ojo/Pz9GRkZNTU1TU1NaWlpgYGBoaGhvb293d3d+fn6EhISKioqSkpKYmJienp6lpaWrq6uxsbG5ubm/v7/FxcXLy8vS0tLY2Nje3t7l5eXr6+vx8fH4+Pj+/v7///8AAAA5TEFNRTMuMTAwAUEAALYgJALkTYAAAA4AA5wBAOgYQD/+M4wC4PHYAQMQAAAP8ZJDkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk/+MYxA8AAANIAAAAABYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhY/+MYxBoFEANYAUwAAFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhY");
      silentSound.play().catch(() => {});
    };
    
    document.addEventListener('touchstart', unlockAudio, { once: true });
    document.addEventListener('click', unlockAudio, { once: true });
    
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
    
    await audioService.playSound(type);
  }, [isMuted, audioService]);

  return {
    playStartSound: () => playSound('start'),
    playEndSound: () => playSound('end'),
    audioStore
  };
};

