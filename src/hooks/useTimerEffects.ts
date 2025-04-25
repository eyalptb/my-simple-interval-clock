
import { useEffect } from 'react';
import { TimerState } from '@/types/timer';
import { TimerControls } from '@/types/timer';
import { useTimerAudio } from './useTimerAudio';
import { useTimerInterval } from './useTimerInterval';

export const useTimerEffects = (state: TimerState, controls: TimerControls) => {
  const {
    isRunning,
    minutes,
    seconds,
    isResting,
    isMuted,
    restMinutes,
    restSeconds,
  } = state;

  const { timerRef, resetTimer, audioStore } = controls;

  const { playStartSound, playEndSound } = useTimerAudio(isMuted);
  const intervalStore = useTimerInterval(state, {
    timerRef,
    resetTimer,
    playStartSound,
    playEndSound,
  });

  // Update timer reference when values change
  useEffect(() => {
    if (!isRunning && !isResting) {
      timerRef.current = {
        workoutMin: minutes,
        workoutSec: seconds,
        restMin: restMinutes,
        restSec: restSeconds
      };
    }
  }, [minutes, seconds, restMinutes, restSeconds, isRunning, isResting]);

  return {
    intervalStore,
  };
};
