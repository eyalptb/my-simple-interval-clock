
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
      audioStore.current.startSound = new Audio('/src/assets/audio/go.mp3');
      audioStore.current.startSound.volume = 1.0;
      audioStore.current.startSound.preload = "auto";
    }
    
    if (!audioStore.current.endSound) {
      audioStore.current.endSound = new Audio('/src/assets/audio/whistle.mp3');
      audioStore.current.endSound.volume = 1.0;
      audioStore.current.endSound.preload = "auto";
    }
    
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
      const audio = type === 'start' ? audioStore.current.startSound : audioStore.current.endSound;
      
      if (audio) {
        // Reset the audio to start
        audio.currentTime = 0;
        
        console.log(`Playing ${type} sound`);
        const playPromise = audio.play();
        
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.error(`Error playing ${type} sound:`, error);
            
            // Create a fresh audio element and try again
            const newAudio = new Audio(type === 'start' ? '/src/assets/audio/go.mp3' : '/src/assets/audio/whistle.mp3');
            newAudio.volume = 1.0;
            newAudio.play().catch(e => console.error('Second attempt failed:', e));
            
            // Update the reference
            if (type === 'start') {
              audioStore.current.startSound = newAudio;
            } else {
              audioStore.current.endSound = newAudio;
            }
          });
        }
        
        audioStore.current.attemptedToPlay = true;
      }
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
