import { useEffect, useRef, useCallback } from 'react';
import AudioService from '@/services/AudioService';
import { useIOSTimerAudio } from './useIOSTimerAudio';

export const useTimerAudio = (isMuted: boolean) => {
  const hasInitialized = useRef(false);
  const audioService = AudioService.getInstance();
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  
  const iOSAudio = useIOSTimerAudio(isMuted);
  
  useEffect(() => {
    if (hasInitialized.current || isIOS) return;
    
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
  }, [audioService, isIOS]);

  useEffect(() => {
    if (!isIOS) {
      audioService.setMute(isMuted);
    }
  }, [isMuted, audioService, isIOS]);

  const playStartSound = useCallback(async () => {
    if (isMuted) return;
    
    if (isIOS) {
      await iOSAudio.playStartSound();
    } else {
      try {
        audioService.prepareStartSound();
        await audioService.playSound('start');
      } catch (error) {
        console.error('Error playing start sound:', error);
      }
    }
  }, [isMuted, audioService, isIOS, iOSAudio]);

  const playEndSound = useCallback(async () => {
    if (isMuted) return;
    
    if (isIOS) {
      await iOSAudio.playEndSound();
    } else {
      try {
        await audioService.playSound('end');
      } catch (error) {
        console.error('Error playing end sound:', error);
      }
    }
  }, [isMuted, audioService, isIOS, iOSAudio]);

  const registerReset = useCallback(() => {
    if (!isIOS) {
      audioService.registerReset();
    }
  }, [audioService, isIOS]);

  const prepareStartSound = useCallback(() => {
    if (!isIOS) {
      audioService.prepareStartSound();
    }
  }, [audioService, isIOS]);

  return {
    playStartSound,
    playEndSound,
    registerReset,
    prepareStartSound
  };
};
