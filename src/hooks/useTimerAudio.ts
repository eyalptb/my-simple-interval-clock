
import { useEffect, useRef, useCallback } from 'react';
import AudioService from '@/services/AudioService';

export const useTimerAudio = (isMuted: boolean) => {
  // Track initialization
  const hasInitialized = useRef(false);
  const audioService = AudioService.getInstance();
  
  // Effect to initialize audio service
  useEffect(() => {
    if (hasInitialized.current) return;
    
    const initializeAudio = () => {
      audioService.initializeAudioContext()
        .then(() => {
          audioService.initializeSounds();
          hasInitialized.current = true;
        });
    };

    // Use user interactions to initialize audio
    const userEvents = ['touchstart', 'mousedown', 'keydown', 'click'];
    const eventHandlers = userEvents.map(eventName => {
      const handler = () => {
        console.log(`Audio initialized via ${eventName} event`);
        initializeAudio();
        // Remove listeners after initialization
        userEvents.forEach((event, i) => {
          document.removeEventListener(event, eventHandlers[i]);
        });
      };
      
      document.addEventListener(eventName, handler, { once: true });
      return handler;
    });
    
    // Try immediate initialization
    initializeAudio();
    
    // Clean up
    return () => {
      userEvents.forEach((event, i) => {
        document.removeEventListener(event, eventHandlers[i]);
      });
    };
  }, [audioService]);

  // Update mute state in audio service
  useEffect(() => {
    audioService.setMute(isMuted);
  }, [isMuted, audioService]);

  // Play start sound with iOS preparation
  const playStartSound = useCallback(async () => {
    if (isMuted) {
      console.log('Audio is muted, not playing start sound');
      return;
    }
    
    try {
      // Always prepare start sound before playing
      audioService.prepareStartSound();
      await audioService.playSound('start');
    } catch (error) {
      console.error('Error playing start sound:', error);
    }
  }, [isMuted, audioService]);

  // Play end sound
  const playEndSound = useCallback(async () => {
    if (isMuted) {
      console.log('Audio is muted, not playing end sound');
      return;
    }
    
    try {
      await audioService.playSound('end');
    } catch (error) {
      console.error('Error playing end sound:', error);
    }
  }, [isMuted, audioService]);

  // Register a reset operation
  const registerReset = useCallback(() => {
    audioService.registerReset();
  }, [audioService]);

  // Prepare for playing start sound
  const prepareStartSound = useCallback(() => {
    audioService.prepareStartSound();
  }, [audioService]);

  return {
    playStartSound,
    playEndSound,
    registerReset,
    prepareStartSound
  };
};
