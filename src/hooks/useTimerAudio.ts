
import { useEffect, useRef, useCallback } from 'react';
import AudioService from '@/services/AudioService';
import goMp3 from '@/assets/audio/go.mp3';
import whistleMp3 from '@/assets/audio/whistle.mp3';

interface AudioStore {
  startSound: HTMLAudioElement | null;
  endSound: HTMLAudioElement | null;
  attemptedToPlay: boolean;
  audioContext: AudioContext | null;
}

export const useTimerAudio = (isMuted: boolean) => {
  const audioStore = useRef<AudioStore>({
    startSound: null,
    endSound: null,
    attemptedToPlay: false,
    audioContext: null
  });
  
  const audioService = AudioService.getInstance();

  useEffect(() => {
    // Create audio elements
    if (!audioStore.current.startSound) {
      audioStore.current.startSound = new Audio(goMp3);
      audioStore.current.startSound.volume = 1.0;
      audioStore.current.startSound.preload = "auto";
    }
    
    if (!audioStore.current.endSound) {
      audioStore.current.endSound = new Audio(whistleMp3);
      audioStore.current.endSound.volume = 1.0;
      audioStore.current.endSound.preload = "auto";
    }
    
    // Better initialization approach for iOS compatibility
    const initializeAudioContext = () => {
      try {
        if (!audioStore.current.audioContext) {
          // Use type assertion to handle webkit prefix
          const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
          audioStore.current.audioContext = new AudioContext();
          console.log('Audio context initialized successfully');
        }
        
        // Enhanced preloading of audio files - both sounds at once
        const preloadAudio = async () => {
          try {
            // Create separate temporary Audio objects for initialization
            // This prevents interference with the main audio objects
            const tempStart = new Audio(goMp3);
            const tempEnd = new Audio(whistleMp3);
            
            // Set to silent
            tempStart.volume = 0;
            tempEnd.volume = 0;
            
            // Play and immediately pause both
            await Promise.all([
              tempStart.play().catch(() => console.log("Silent start init - expected error on iOS")),
              tempEnd.play().catch(() => console.log("Silent end init - expected error on iOS"))
            ]);
            
            // Pause immediately
            setTimeout(() => {
              tempStart.pause();
              tempEnd.pause();
              console.log("Both sounds initialized silently");
            }, 10);
            
            // Also initialize the service's audio objects separately
            audioService.initializeSounds();
            
          } catch (e) {
            console.log("Silent initialization attempt completed");
          }
        };
        
        // Run the preloader
        preloadAudio();
        
      } catch (error) {
        console.error('Failed to initialize audio context:', error);
      }
    };

    // Add event listeners to try initializing audio on various interactions
    const initEvents = ['touchstart', 'click', 'mousedown', 'keydown'];
    const initHandler = () => {
      initializeAudioContext();
      // Remove all listeners after first interaction
      initEvents.forEach(event => {
        document.removeEventListener(event, initHandler);
      });
    };

    // Add listeners for all events
    initEvents.forEach(event => {
      document.addEventListener(event, initHandler, { once: true });
    });
    
    return () => {
      // Cleanup listeners and sounds
      initEvents.forEach(event => {
        document.removeEventListener(event, initHandler);
      });
      
      if (audioStore.current.startSound) {
        audioStore.current.startSound.pause();
      }
      if (audioStore.current.endSound) {
        audioStore.current.endSound.pause();
      }
    };
  }, [audioService]);

  const playSound = useCallback(async (type: 'start' | 'end') => {
    if (isMuted) {
      console.log('Audio is muted, not playing sound');
      return;
    }
    
    try {
      // Ensure the audio context is resumed before playing
      if (audioStore.current.audioContext && audioStore.current.audioContext.state === 'suspended') {
        await audioStore.current.audioContext.resume();
      }
      
      // Use the audio service to play the sound
      await audioService.playSound(type);
    } catch (error) {
      console.error(`Error playing ${type} sound:`, error);
    }
  }, [isMuted, audioService]);

  return {
    playStartSound: () => playSound('start'),
    playEndSound: () => playSound('end'),
    audioStore
  };
};
