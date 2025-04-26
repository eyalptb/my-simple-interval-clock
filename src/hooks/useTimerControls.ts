
import { useRef } from 'react';
import { TimerState, ResetTimerValues } from '@/types/timer';
import { useTimerAudio } from './useTimerAudio';
import AudioService from '@/services/AudioService';

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

  // Add a ref to track if we're in a reset state to prevent sounds
  const isInResetState = useRef<boolean>(false);
  const intervalStore = useRef<{ id?: number }>({});
  const lastActionTime = useRef<number>(0);
  // Track if we've already played start sound for iOS
  const hasPlayedStartSound = useRef<boolean>(false);

  const startTimer = () => {
    // More aggressive rate limiting to prevent rapid action execution
    const now = Date.now();
    if (now - lastActionTime.current < 3000) { // Increased from 2000 to 3000ms
      console.log("Action blocked: Too soon after last action (must wait 3 seconds)");
      return;
    }
    
    // Check if AudioService thinks we're in reset cooldown
    if (AudioService.getInstance().isWithinResetCooldown()) {
      console.log("Start blocked: Still in reset cooldown period");
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
        
        // Always reset iOS sound played state before trying to play
        if (!hasPlayedStartSound.current) {
          console.log("First timer start of the session - ensuring iOS start sound can play");
          resetIOSSoundState();
          hasPlayedStartSound.current = true;
        } else {
          // For subsequent starts, we need to specifically reset just the start sound
          AudioService.getInstance().resetSpecificIOSSound('start');
          console.log("Subsequent timer start - iOS start sound state reset");
        }
        
        // Play start sound when timer begins with a small delay
        setTimeout(() => {
          playStartSound();
          console.log("Timer started: Playing start sound (delayed)");
        }, 100);
      } else {
        console.log("In reset state, not playing start sound");
        // Clear the reset state after handling this interaction
        setTimeout(() => {
          isInResetState.current = false;
        }, 3000); // Reduced to give a chance for next play
      }
      
      setIsRunning(true);
      setIsPaused(false);
    }
  };

  const pauseTimer = () => {
    // More aggressive rate limiting
    const now = Date.now();
    if (now - lastActionTime.current < 3000) { // Increased from 2000 to 3000ms
      console.log("Action blocked: Too soon after last action (must wait 3 seconds)");
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
    // More aggressive rate limiting
    const now = Date.now();
    if (now - lastActionTime.current < 5000) { // Increased from 3000 to 5000ms
      console.log("Reset blocked: Too soon after last action (must wait 5 seconds)");
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
    
    // Set the reset state to prevent sounds for a longer period
    isInResetState.current = true;
    
    // Use the audio hook's method to disable sounds with longer timeout
    disableSoundsTemporarily();
    
    // Also directly use the AudioService to block sounds even more aggressively
    AudioService.getInstance().blockSoundsTemporarily(15000); // Increased from 10000 to 15000ms
    
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
    }, 15000);  // INCREASED FROM 10000ms to 15000ms
    
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
    resetIOSSoundState,
    hasPlayedStartSound // Export this to track if we've played start sound
  };
};
