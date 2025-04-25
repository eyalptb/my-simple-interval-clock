
import { TimerState } from '@/types/timer';

export const useTimeInputs = (state: TimerState) => {
  const {
    isRunning,
    setMinutesState,
    setSecondsState,
    setRestMinutesState,
    setRestSecondsState,
    setTotalRepetitionsState,
    pendingTimeUpdateRef
  } = state;

  const setMinutes = (min: number) => {
    if (!isRunning) {
      if (pendingTimeUpdateRef.current) {
        clearTimeout(pendingTimeUpdateRef.current);
      }
      
      const validMin = Math.min(99, Math.max(0, min));
      
      pendingTimeUpdateRef.current = setTimeout(() => {
        setMinutesState(validMin);
        pendingTimeUpdateRef.current = null;
      }, 50);
    }
  };
  
  const setSeconds = (sec: number) => {
    if (!isRunning) {
      if (pendingTimeUpdateRef.current) {
        clearTimeout(pendingTimeUpdateRef.current);
      }
      
      if (sec >= 60) {
        const minutesToAdd = Math.floor(sec / 60);
        const remainingSeconds = sec % 60;
        setSecondsState(remainingSeconds);
        setMinutesState(prev => Math.min(99, prev + minutesToAdd));
        return;
      }
      
      const validSec = Math.min(59, Math.max(0, sec));
      
      pendingTimeUpdateRef.current = setTimeout(() => {
        setSecondsState(validSec);
        pendingTimeUpdateRef.current = null;
      }, 50);
    }
  };
  
  const setTotalRepetitions = (reps: number) => {
    if (!isRunning) setTotalRepetitionsState(reps);
  };

  return {
    setMinutes,
    setSeconds,
    setTotalRepetitions,
  };
};
