
import { useRef } from 'react';
import { toast } from '@/components/ui/use-toast';
import { TimerState } from '@/types/timer';

export const useTimerControls = (state: TimerState) => {
  const {
    setIsRunning,
    setIsPaused,
    setIsResting,
    setCurrentRepetition,
    isMuted,
  } = state;

  const startSoundRef = useRef<HTMLAudioElement | null>(null);
  const endSoundRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<number | null>(null);
  const pendingTimeUpdateRef = useRef<NodeJS.Timeout | null>(null);

  const startTimer = () => {
    if (!state.isRunning && (state.minutes > 0 || state.seconds > 0)) {
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
    pendingTimeUpdateRef,
  };
};
