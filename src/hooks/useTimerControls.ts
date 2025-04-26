
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
  const { playStartSound, playEndSound, disableSoundsTemporarily, resetIOSSoundState } = useTimerAudio(isMuted);

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

  // Add a ref to track if we're in a reset state to prevent sounds from playing - MORE AGGRESSIVELY RESET
  const isInResetState = useRef<boolean>(false);
  const intervalStore = useRef<{ id?: number }>({});
  const lastActionTime = useRef<number>(0);

  const startTimer = () => {
    // Rate limiting to prevent rapid action execution
    const now = Date.now();
    if (now - lastActionTime.current < 1000) {
      console.log("Action blocked: Too soon after last action");
      return;
    }
    lastActionTime.current = now;

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
        
        // Reset iOS sound played state to allow start sound
        resetIOSSoundState();
        
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
    // Rate limiting to prevent rapid action execution
    const now = Date.now();
    if (now - lastActionTime.current < 1000) {
      console.log("Action blocked: Too soon after last action");
      return;
    }
    lastActionTime.current = now;
    
    if (state.isRunning) {
      setIsRunning(false);
      setIsPaused(true);
      
      if (intervalStore.current.id) {
        window.clearInterval(intervalStore.current.id);
      }
    }
  };

  const resetTimer = (): ResetTimerValues => {
    // Rate limiting to prevent rapid action execution
    const now = Date.now();
    if (now - lastActionTime.current < 1000) {
      console.log("Reset blocked: Too soon after last action");
      // Still return the current values
      return {
        minutes: minutes,
        seconds: seconds,
        restMinutes: state.restMinutes,
        restSeconds: state.restSeconds
      };
    }
    lastActionTime.current = now;
    
    console.log("Starting reset timer function - SILENT reset");
    
    // Set the reset state to prevent sounds
    isInResetState.current = true;
    
    // Also use the audio hook's method to disable sounds with longer timeout
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
    
    // Clear reset state after a longer delay to prevent sounds on immediate button presses
    setTimeout(() => {
      isInResetState.current = false;
      console.log("Reset state cleared");
    }, 5000);  // INCREASED FROM 2500ms to 5000ms
    
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
    resetIOSSoundState
  };
};
