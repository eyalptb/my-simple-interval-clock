
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

  const resetTimer = (): ResetTimerValues => {
    console.log("Starting reset timer function");
    
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
    
    // Make sure we get the original values to reset to
    const initialWorkoutMin = timerRef.current.workoutMin || 0;
    const initialWorkoutSec = timerRef.current.workoutSec || 40;
    const initialRestMin = timerRef.current.restMin || 1;
    const initialRestSec = timerRef.current.restSec || 0;
    
    console.log("Before reset - Timer state:", {
      minutes: state.minutes,
      seconds: state.seconds,
      restMinutes: state.restMinutes,
      restSeconds: state.restSeconds
    });
    
    // IMPORTANT: Directly update state values to ensure immediate change
    setMinutesState(0);  // Always reset to 0
    setSecondsState(40);  // Always reset to 40 seconds
    setRestMinutesState(1);  // Always reset to 1 minute rest
    setRestSecondsState(0);  // Always reset to 0 seconds rest
    
    // Log for debugging
    console.log('Reset timer values:', {
      workoutMin: 0, 
      workoutSec: 40,
      restMin: 1,
      restSec: 0
    });
    
    // Return fixed reset values for immediate UI update
    return {
      minutes: 0,
      seconds: 40,
      restMinutes: 1,
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
    audioStore,
    playStartSound,
    playEndSound,
  };
};
