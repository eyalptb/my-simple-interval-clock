
import { useRef } from 'react';
import { TimerState, ResetTimerValues } from '@/types/timer';
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
    setMinutesState,
    setSecondsState,
    setRestMinutesState,
    setRestSecondsState
  } = state;

  // Initialize audio hooks with correct muting state
  const { playStartSound, playEndSound } = useTimerAudio(isMuted);

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

  const resetTimer = (): ResetTimerValues => {
    console.log("Starting reset timer function - SILENT reset");
    
    // Clear any active interval
    if (intervalStore.current.id) {
      window.clearInterval(intervalStore.current.id);
      intervalStore.current.id = undefined;
      console.log("Cleared interval");
    }
    
    // Reset timer state
    setIsRunning(false);
    setIsPaused(false);
    setIsResting(false);
    setCurrentRepetition(1);
    
    // IMPORTANT: Directly update state values to ensure immediate change
    setMinutesState(0);  // Reset to 0
    setSecondsState(0);  // Reset to 0
    setRestMinutesState(0);  // Reset to 0
    setRestSecondsState(0);  // Reset to 0
    
    // Log for debugging
    console.log('Reset timer values:', {
      workoutMin: 0, 
      workoutSec: 0,
      restMin: 0,
      restSec: 0
    });
    
    // Return fixed reset values for immediate UI update
    return {
      minutes: 0,
      seconds: 0,
      restMinutes: 0,
      restSeconds: 0
    };
  };

  return {
    startTimer,
    pauseTimer,
    resetTimer,
    timerRef,
    intervalStore,
    pendingTimeUpdateRef: state.pendingTimeUpdateRef,
    playStartSound,
    playEndSound,
  };
};
