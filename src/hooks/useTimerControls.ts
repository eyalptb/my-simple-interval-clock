
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
  const { 
    playStartSound, 
    playEndSound, 
    registerReset, 
    registerPlusButtonPress, 
    prepareStartSound 
  } = useTimerAudio(isMuted);

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

  // Track timer state
  const isInResetState = useRef<boolean>(false);
  const intervalStore = useRef<{ id?: number }>({});
  const lastActionTime = useRef<number>(0);
  const soundPlayedForThisSession = useRef<boolean>(false);

  const startTimer = () => {
    // Rate limiting for actions
    const now = Date.now();
    if (now - lastActionTime.current < 3000) {
      console.log("Action blocked: Too soon after last action");
      return;
    }
    lastActionTime.current = now;

    if (!state.isRunning && (minutes > 0 || seconds > 0)) {
      // Update timer reference
      if (!state.isResting) {
        timerRef.current = {
          workoutMin: minutes,
          workoutSec: seconds,
          restMin: state.restMinutes,
          restSec: state.restSeconds
        };
      }
      
      // Prepare and play start sound with a small delay
      prepareStartSound();
      
      // Allow the start sound to play
      soundPlayedForThisSession.current = false;
      
      // Set timer state
      setIsRunning(true);
      setIsPaused(false);
      
      // Play start sound after a small delay
      setTimeout(() => {
        playStartSound();
      }, 100);
    }
  };

  const pauseTimer = () => {
    // Rate limiting
    const now = Date.now();
    if (now - lastActionTime.current < 3000) {
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
    // Rate limiting for reset
    const now = Date.now();
    if (now - lastActionTime.current < 5000) {
      console.log("Reset blocked: Too soon after last action");
      // Return current values without resetting
      return {
        minutes: minutes,
        seconds: seconds,
        restMinutes: state.restMinutes,
        restSeconds: state.restSeconds
      };
    }
    lastActionTime.current = now;
    
    console.log("Starting reset timer function - SILENT reset");
    
    // Set reset state
    isInResetState.current = true;
    
    // Register reset with audio service
    registerReset();
    
    // Clear interval
    if (intervalStore.current.id) {
      window.clearInterval(intervalStore.current.id);
      intervalStore.current.id = undefined;
    }
    
    // Reset timer state
    setIsRunning(false);
    setIsPaused(false);
    setIsResting(false);
    setCurrentRepetition(1);
    
    // Reset to zero values
    setMinutesState(0);
    setSecondsState(0);
    setRestMinutesState(0);
    setRestSecondsState(0);
    
    // Reset sound tracking
    soundPlayedForThisSession.current = false;
    
    // Clear reset state after delay
    setTimeout(() => {
      isInResetState.current = false;
    }, 30000);  // 30 seconds delay
    
    return {
      minutes: 0,
      seconds: 0,
      restMinutes: 0,
      restSeconds: 0
    };
  };
  
  // Track plus button presses
  const registerPlusButton = () => {
    registerPlusButtonPress();
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
    isInResetState,
    registerPlusButton
  };
};
