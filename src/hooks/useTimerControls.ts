
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
  const { playStartSound, playEndSound, disableSoundsTemporarily } = useTimerAudio(isMuted);

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

  // Add a ref to track if we're in a reset state to prevent sounds from playing
  const isInResetState = useRef<boolean>(false);
  const intervalStore = useRef<{ id?: number }>({});

  const startTimer = () => {
    if (!state.isRunning && (minutes > 0 || seconds > 0)) {
      // Don't play sounds if we're in a reset state
      if (!isInResetState.current) {
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
      } else {
        console.log("In reset state, not playing start sound");
        // Clear the reset state after handling this interaction
        setTimeout(() => {
          isInResetState.current = false;
        }, 1000);
      }
      
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
    
    // Set the reset state to prevent sounds
    isInResetState.current = true;
    
    // Also use the audio hook's method to disable sounds
    disableSoundsTemporarily();
    
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
    
    // Clear reset state after a delay to prevent sounds on immediate button presses
    setTimeout(() => {
      isInResetState.current = false;
      console.log("Reset state cleared");
    }, 1000);
    
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
    isInResetState, // Export this so it can be used in other components
  };
};
