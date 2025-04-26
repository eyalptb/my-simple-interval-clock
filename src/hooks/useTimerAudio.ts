
import { useEffect, useRef, useCallback } from 'react';
import AudioService from '@/services/AudioService';
import goMp3 from '@/assets/audio/go.mp3';
import whistleMp3 from '@/assets/audio/whistle.mp3';

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
    
    // Initialize audio context for iOS compatibility
    const initializeAudioContext = () => {
      try {
        // Use type assertion to handle webkit prefix
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        
        // Create a silent buffer and play it
        const buffer = audioContext.createBuffer(1, 1, 22050);
        const source = audioContext.createBufferSource();
        source.buffer = buffer;
        source.connect(audioContext.destination);
        source.start(0);
        
        // Only try to play a quick silent version of each sound to initialize them
        // But don't actually play them fully - just initialize the audio context
        const silentPlay = async (audio: HTMLAudioElement | null) => {
          if (audio) {
            // Save the original volume
            const originalVolume = audio.volume;
            // Set to silent
            audio.volume = 0;
            // Short play attempt
            try {
              await audio.play();
              // Pause immediately
              setTimeout(() => {
                audio.pause();
                audio.currentTime = 0;
                // Restore original volume
                audio.volume = originalVolume;
              }, 10);
            } catch (e) {
              // Restore volume even on error
              audio.volume = originalVolume;
              console.log("Silent initialization failed, but this is okay:", e);
            }
          }
        };
        
        // Initialize both sounds silently
        silentPlay(audioStore.current.startSound);
        silentPlay(audioStore.current.endSound);

        console.log('Audio context initialized for iOS compatibility');
      } catch (error) {
        console.error('Failed to initialize audio context:', error);
      }
    };

    // Add event listeners to try initializing audio on various interactions
    const initEvents = ['touchstart', 'click', 'mousedown'];
    const initHandler = () => {
      initializeAudioContext();
      initEvents.forEach(event => {
        document.removeEventListener(event, initHandler);
      });
    };

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
