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

  const { 
    playStartSound, 
    playEndSound, 
    registerReset,
    prepareStartSound 
  } = useTimerAudio(isMuted);

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
  const lastActionTime = useRef<number>(0);
  const soundPlayedForThisSession = useRef<boolean>(false);
  const wasRecentlyPaused = useRef<boolean>(false);

  const startTimer = () => {
    // Fix for issue #1: Allow timer to start even at 00:00 when in paused state
    if ((!state.isRunning && (minutes > 0 || seconds > 0)) || state.isPaused) {
      // Always update timerRef with current values when starting
      // This ensures we have the latest values for reset after completing all repetitions
      if (!state.isResting) {
        timerRef.current = {
          workoutMin: minutes,
          workoutSec: seconds,
          restMin: state.restMinutes,
          restSec: state.restSeconds
        };
      }
      
      // Only prepare and play start sound if not resuming from pause
      if (!state.isPaused) {
        prepareStartSound();
        soundPlayedForThisSession.current = false;
        
        setTimeout(() => {
          playStartSound();
        }, 100);
      } else {
        // Mark that we're resuming from pause to avoid playing sound
        wasRecentlyPaused.current = true;
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
    const now = Date.now();
    if (now - lastActionTime.current < 5000) {
      return {
        minutes: minutes,
        seconds: seconds,
        restMinutes: state.restMinutes,
        restSeconds: state.restSeconds
      };
    }
    lastActionTime.current = now;
    
    registerReset();
    
    if (intervalStore.current.id) {
      window.clearInterval(intervalStore.current.id);
      intervalStore.current.id = undefined;
    }
    
    setIsRunning(false);
    setIsPaused(false);
    setIsResting(false);
    setCurrentRepetition(1);
    
    // Reset to 0 when user presses the reset button
    setMinutesState(0);
    setSecondsState(0);
    setRestMinutesState(0);
    setRestSecondsState(0);
    
    soundPlayedForThisSession.current = false;
    wasRecentlyPaused.current = false;
    
    // Keep reference values unchanged for workout completion restoration
    return {
      minutes: 0,
      seconds: 0,
      restMinutes: 0,
      restSeconds: 0
    };
  };
  
  const registerPlusButton = () => {};

  return {
    startTimer,
    pauseTimer,
    resetTimer,
    timerRef,
    intervalStore,
    pendingTimeUpdateRef: state.pendingTimeUpdateRef,
    playStartSound,
    playEndSound,
    registerPlusButton,
    wasRecentlyPaused
  };
};
