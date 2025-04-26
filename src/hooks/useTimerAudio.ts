
import { useEffect, useRef, useCallback } from 'react';
import AudioService from '@/services/AudioService';

export const useTimerAudio = (isMuted: boolean) => {
  const hasInitialized = useRef(false);
  const audioService = AudioService.getInstance();
  
  useEffect(() => {
    if (hasInitialized.current) return;
    
    const initializeAudio = () => {
      audioService.initializeAudioContext()
        .then(() => {
          audioService.initializeSounds();
          hasInitialized.current = true;
        });
    };

    const userEvents = ['touchstart', 'mousedown', 'keydown', 'click'];
    const eventHandlers = userEvents.map(eventName => {
      const handler = () => {
        initializeAudio();
        userEvents.forEach((event, i) => {
          document.removeEventListener(event, eventHandlers[i]);
        });
      };
      
      document.addEventListener(eventName, handler, { once: true });
      return handler;
    });
    
    initializeAudio();
    
    return () => {
      userEvents.forEach((event, i) => {
        document.removeEventListener(event, eventHandlers[i]);
      });
    };
  }, [audioService]);

  useEffect(() => {
    audioService.setMute(isMuted);
  }, [isMuted, audioService]);

  const playStartSound = useCallback(async () => {
    if (isMuted) return;
    
    try {
      audioService.prepareStartSound();
      await audioService.playSound('start');
    } catch (error) {
      console.error('Error playing start sound:', error);
    }
  }, [isMuted, audioService]);

  const playEndSound = useCallback(async () => {
    if (isMuted) return;
    
    try {
      await audioService.playSound('end');
    } catch (error) {
      console.error('Error playing end sound:', error);
    }
  }, [isMuted, audioService]);

  const registerReset = useCallback(() => {
    audioService.registerReset();
  }, [audioService]);

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
