
import { useEffect, useRef, useCallback } from 'react';
import AudioService from '@/services/AudioService';

export const useTimerAudio = (isMuted: boolean) => {
  // We'll use a ref to track if we've tried to initialize audio
  const hasInitialized = useRef(false);
  const audioService = AudioService.getInstance();
  const lastPlayTime = useRef<number>(0);

  // Special flag to prevent sound after reset - INCREASED TIMEOUT
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

  // Function to temporarily disable sounds after reset with increased timeout
  const disableSoundsTemporarily = useCallback(() => {
    preventSoundAfterReset.current = true;
    
    // Clear any existing timeout
    if (resetTimeoutId.current) {
      window.clearTimeout(resetTimeoutId.current);
    }
    
    // Use the AudioService to block sounds at the service level - increased to 15 seconds
    audioService.blockSoundsTemporarily(15000); // Increased from 10000 to 15000ms
    
    // Re-enable sounds after a cooldown period - INCREASED FROM 10000 to 15000ms
    resetTimeoutId.current = window.setTimeout(() => {
      preventSoundAfterReset.current = false;
      resetTimeoutId.current = null;
      console.log('Sound prevention after reset has been cleared');
    }, 15000) as unknown as number;
    
    console.log('Sounds temporarily disabled after reset - extended time period (15s)');
  }, [audioService]);

  // Rate-limited sound player with type-specific handling and improved iOS handling
  const playSound = useCallback(async (type: 'start' | 'end') => {
    if (isMuted) {
      console.log('Audio is muted, not playing sound');
      return;
    }
    
    // Check if we're in a reset prevention period
    if (preventSoundAfterReset.current) {
      console.log('Sound prevented: reset protection active', {type});
      return;
    }
    
    // Check if AudioService thinks we're in reset cooldown
    if (audioService.isWithinResetCooldown()) {
      console.log(`Sound prevented: AudioService reports we're in reset cooldown - ${type}`);
      return;
    }
    
    // Prevent rapid sound playback - INCREASED FROM 3000 to 5000ms
    const now = Date.now();
    if (now - lastPlayTime.current < 5000) {
      console.log(`Preventing ${type} sound overlap - too soon after last play`);
      return;
    }
    
    lastPlayTime.current = now;
    
    try {
      // For start sound on iOS, ensure we can play it by resetting its state if needed
      if (type === 'start') {
        // Reset iOS start sound played state right before attempting to play
        audioService.resetSpecificIOSSound('start');
        console.log('Explicitly reset iOS start sound state before play attempt');
      }
      
      await audioService.playSound(type);
    } catch (error) {
      console.error(`Error playing ${type} sound:`, error);
    }
  }, [isMuted, audioService]);

  // Reset iOS sound played state when timer is started
  const resetIOSSoundState = useCallback(() => {
    // Reset iOS start sound played state to allow it to play again
    audioService.resetSpecificIOSSound('start');
    console.log('iOS start sound state reset specifically');
  }, [audioService]);

  return {
    playStartSound: () => playSound('start'),
    playEndSound: () => playSound('end'),
    disableSoundsTemporarily,
    resetIOSSoundState
  };
};
