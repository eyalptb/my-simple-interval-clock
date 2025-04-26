
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

  const startTimer = () => {
    const now = Date.now();
    if (now - lastActionTime.current < 3000) {
      return;
    }
    lastActionTime.current = now;

    if (!state.isRunning && (minutes > 0 || seconds > 0)) {
      if (!state.isResting) {
        timerRef.current = {
          workoutMin: minutes,
          workoutSec: seconds,
          restMin: state.restMinutes,
          restSec: state.restSeconds
        };
      }
      
      prepareStartSound();
      soundPlayedForThisSession.current = false;
      
      setIsRunning(true);
      setIsPaused(false);
      
      setTimeout(() => {
        playStartSound();
      }, 100);
    }
  };

  const pauseTimer = () => {
    const now = Date.now();
    if (now - lastActionTime.current < 3000) {
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
    
    setMinutesState(0);
    setSecondsState(0);
    setRestMinutesState(0);
    setRestSecondsState(0);
    
    soundPlayedForThisSession.current = false;
    
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
    registerPlusButton
  };
};
