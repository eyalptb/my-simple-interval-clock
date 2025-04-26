
import { useRef } from 'react';
import { TimerState } from '@/types/timer';
import { useTimerAudio } from './useTimerAudio';

export const useTimerControls = (state: TimerState) => {
  const {
    setIsRunning,
    setIsPaused,
    setIsResting,
    setCurrentRepetition,
    minutes,
    seconds,
    isMuted,
  } = state;

  // Initialize audio hooks with correct muting state
  const { playStartSound, playEndSound, audioStore } = useTimerAudio(isMuted);

  // Create refs for timer settings
  const timerRef = useRef<{
    workoutMin: number;
    workoutSec: number;
    restMin: number;
    restSec: number;
  }>({
    workoutMin: minutes,
    workoutSec: seconds,
    restMin: state.restMinutes,
    restSec: state.restSeconds
  });

  const intervalStore = useRef<{ id?: number }>({});

  const startTimer = () => {
    if (!state.isRunning && (minutes > 0 || seconds > 0)) {
      // Update timer reference with current values before starting
      if (!state.isResting) {
        timerRef.current = {
          workoutMin: minutes,
          workoutSec: seconds,
          restMin: state.restMinutes,
          restSec: state.restSeconds
        };
      }
      
      // Play start sound when timer begins
      playStartSound();
      console.log("Timer started: Playing start sound");
      
      setIsRunning(true);
      setIsPaused(false);
    }
  };

  const pauseTimer = () => {
    if (state.isRunning) {
      setIsRunning(false);
      setIsPaused(true);
      
      if (intervalStore.current.id) {
        window.clearInterval(intervalStore.current.id);
      }
    }
  };

  const resetTimer = () => {
    if (intervalStore.current.id) {
      window.clearInterval(intervalStore.current.id);
      intervalStore.current.id = undefined;
    }
    
    setIsRunning(false);
    setIsPaused(false);
    setIsResting(false);
    setCurrentRepetition(1);
    
    state.setMinutesState(timerRef.current.workoutMin);
    state.setSecondsState(timerRef.current.workoutSec);
    state.setRestMinutesState(timerRef.current.restMin);
    state.setRestSecondsState(timerRef.current.restSec);
  };

  return {
    startTimer,
    pauseTimer,
    resetTimer,
    timerRef,
    intervalStore,
    pendingTimeUpdateRef: state.pendingTimeUpdateRef,
    audioStore,
    playStartSound,
    playEndSound,
  };
};
