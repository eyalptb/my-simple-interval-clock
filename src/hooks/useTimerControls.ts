
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
    
    // Store initial workout values for reset
    const initialWorkoutMin = timerRef.current.workoutMin;
    const initialWorkoutSec = timerRef.current.workoutSec;
    
    // Store rest values for reset
    const initialRestMin = timerRef.current.restMin;
    const initialRestSec = timerRef.current.restSec;
    
    // First update timer state
    state.setMinutesState(initialWorkoutMin);
    state.setSecondsState(initialWorkoutSec);
    state.setRestMinutesState(initialRestMin);
    state.setRestSecondsState(initialRestSec);
    
    // Log for debugging
    console.log('Reset timer values:', {
      workoutMin: initialWorkoutMin, 
      workoutSec: initialWorkoutSec,
      restMin: initialRestMin,
      restSec: initialRestSec
    });
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
