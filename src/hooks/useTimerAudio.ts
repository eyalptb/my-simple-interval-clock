
import { useEffect, useRef, useCallback } from 'react';
import AudioService from '@/services/AudioService';

export const useTimerAudio = (isMuted: boolean) => {
  // We'll use a ref to track if we've tried to initialize audio
  const hasInitialized = useRef(false);
  const audioService = AudioService.getInstance();
  const lastPlayTime = useRef<number>(0);

  // Special flag to prevent sound after reset
  const preventSoundAfterReset = useRef<boolean>(false);
  const resetTimeoutId = useRef<number | null>(null);

  // Enhanced initialization with improved iOS support
  useEffect(() => {
    if (hasInitialized.current) return;
    
    const initializeAudio = () => {
      audioService.initializeAudioContext()
        .then(() => {
          // After successfully initializing, try to load and pre-initialize both sounds
          audioService.initializeSounds();
          hasInitialized.current = true;
        });
    };

    // Add event listeners for common user interactions
    const userEvents = ['touchstart', 'mousedown', 'keydown', 'click'];
    
    // Create one-time event handlers for each event
    const eventHandlers = userEvents.map(eventName => {
      const handler = () => {
        console.log(`Audio initialized via ${eventName} event`);
        initializeAudio();
        // Remove all event listeners after first interaction
        userEvents.forEach((event, i) => {
          document.removeEventListener(event, eventHandlers[i]);
        });
      };
      
      // Add the event listener
      document.addEventListener(eventName, handler, { once: true });
      return handler;
    });
    
    // We should also try to initialize immediately in case permissions already exist
    initializeAudio();
    
    // Clean up function
    return () => {
      userEvents.forEach((event, i) => {
        document.removeEventListener(event, eventHandlers[i]);
      });

      // Clear any pending timeout
      if (resetTimeoutId.current) {
        window.clearTimeout(resetTimeoutId.current);
        resetTimeoutId.current = null;
      }
    };
  }, [audioService]);

  // Function to temporarily disable sounds after reset
  const disableSoundsTemporarily = useCallback(() => {
    preventSoundAfterReset.current = true;
    
    // Clear any existing timeout
    if (resetTimeoutId.current) {
      window.clearTimeout(resetTimeoutId.current);
    }
    
    // Re-enable sounds after a cooldown period
    resetTimeoutId.current = window.setTimeout(() => {
      preventSoundAfterReset.current = false;
      resetTimeoutId.current = null;
      console.log('Sound prevention after reset has been cleared');
    }, 1500) as unknown as number;
    
    console.log('Sounds temporarily disabled after reset');
  }, []);

  // Rate-limited sound player to prevent overlapping sounds
  const playSound = useCallback(async (type: 'start' | 'end') => {
    if (isMuted) {
      console.log('Audio is muted, not playing sound');
      return;
    }
    
    // Check our reset prevention flag
    if (preventSoundAfterReset.current) {
      console.log('Sounds prevented due to recent reset operation');
      return;
    }
    
    // Prevent rapid sound playback
    const now = Date.now();
    if (now - lastPlayTime.current < 800) { // Increased from 500ms to 800ms
      console.log('Preventing sound overlap - too soon after last play');
      return;
    }
    
    lastPlayTime.current = now;
    
    try {
      await audioService.playSound(type);
    } catch (error) {
      console.error(`Error playing ${type} sound:`, error);
    }
  }, [isMuted, audioService]);

  return {
    playStartSound: () => playSound('start'),
    playEndSound: () => playSound('end'),
    disableSoundsTemporarily,
  };
};
