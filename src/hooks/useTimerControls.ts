
import { useRef } from 'react';
import { TimerState } from '@/types/timer';

export const useTimerControls = (state: TimerState) => {
  const {
    setIsRunning,
    setIsPaused,
    setIsResting,
    setCurrentRepetition,
    isMuted,
    minutes,
    seconds,
  } = state;

  // Create refs with additional properties for audio
  const startSoundRef = useRef<HTMLAudioElement | null>(null);
  const endSoundRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<number | null>(null);

  const startTimer = () => {
    if (!state.isRunning && (minutes > 0 || seconds > 0)) {
      setIsRunning(true);
      setIsPaused(false);
      if (!isMuted) {
        // Access the audio through our custom property
        const startSound = (startSoundRef as any)._audio;
        if (startSound) {
          startSound.play().catch(e => console.error('Error playing start sound:', e));
        }
      }
    }
  };

  const pauseTimer = () => {
    if (state.isRunning) {
      setIsRunning(false);
      setIsPaused(true);
      
      // Clear interval using our custom property
      if ((timerRef as any)._intervalId) {
        window.clearInterval((timerRef as any)._intervalId);
      }
    }
  };

  const resetTimer = () => {
    // Clear interval using our custom property
    if ((timerRef as any)._intervalId) {
      window.clearInterval((timerRef as any)._intervalId);
      (timerRef as any)._intervalId = null;
    }
    
    setIsRunning(false);
    setIsPaused(false);
    setIsResting(false);
    setCurrentRepetition(1);
  };

  return {
    startTimer,
    pauseTimer,
    resetTimer,
    startSoundRef,
    endSoundRef,
    timerRef,
    pendingTimeUpdateRef: state.pendingTimeUpdateRef,
  };
};
