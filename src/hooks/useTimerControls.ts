
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

  // Preload audio files
  const startSoundRef = useRef<HTMLAudioElement | null>(null);
  const endSoundRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<number | null>(null);

  // Initialize audio on first load
  if (startSoundRef.current === null) {
    startSoundRef.current = new Audio('/go.mp3');
  }
  
  if (endSoundRef.current === null) {
    endSoundRef.current = new Audio('/whistle.mp3');
  }

  const startTimer = () => {
    if (!state.isRunning && (minutes > 0 || seconds > 0)) {
      setIsRunning(true);
      setIsPaused(false);
      if (!isMuted && startSoundRef.current) {
        startSoundRef.current.play().catch(e => console.error('Error playing start sound:', e));
      }
    }
  };

  const pauseTimer = () => {
    if (state.isRunning) {
      setIsRunning(false);
      setIsPaused(true);
    }
  };

  const resetTimer = () => {
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
