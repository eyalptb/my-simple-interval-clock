
import { useEffect, useRef } from 'react';
import { TimerState } from '@/types/timer';

export const useTimerInterval = (
  state: TimerState,
  controls: {
    timerRef: React.MutableRefObject<{
      workoutMin: number;
      workoutSec: number;
      restMin: number;
      restSec: number;
    }>;
    resetTimer: () => void;
    playStartSound: () => void;
    playEndSound: () => void;
    wasRecentlyPaused?: React.MutableRefObject<boolean>;
  }
) => {
  const intervalStore = useRef<{ id?: number }>({});
  
  useEffect(() => {
    const {
      isRunning,
      minutes,
      seconds,
      currentRepetition,
      totalRepetitions,
      isResting,
      restMinutes,
      restSeconds,
    } = state;

    if (!isRunning) return;
    
    const intervalId = window.setInterval(() => {
      // Reset the paused flag after first tick
      if (controls.wasRecentlyPaused && controls.wasRecentlyPaused.current) {
        controls.wasRecentlyPaused.current = false;
      }
      
      if (seconds > 0) {
        state.setSecondsState(seconds - 1);
      } else if (minutes > 0) {
        state.setMinutesState(minutes - 1);
        state.setSecondsState(59);
      } else {
        // Timer has reached zero
        
        if (isResting) {
          // Rest period ended
          controls.playStartSound();
          
          if (currentRepetition < totalRepetitions) {
            state.setCurrentRepetition(currentRepetition + 1);
            state.setIsResting(false);
            
            state.setMinutesState(controls.timerRef.current.workoutMin);
            state.setSecondsState(controls.timerRef.current.workoutSec);
          } else {
            // Workout completely finished
            controls.resetTimer();
          }
        } else {
          // Workout period ended
          controls.playEndSound();
          
          if (currentRepetition < totalRepetitions) {
            if (restMinutes === 0 && restSeconds === 0) {
              // No rest time configured, move directly to next repetition
              state.setCurrentRepetition(currentRepetition + 1);
              
              setTimeout(() => {
                controls.playStartSound();
              }, 1000);
              
              state.setMinutesState(controls.timerRef.current.workoutMin);
              state.setSecondsState(controls.timerRef.current.workoutSec);
            } else {
              // Rest time is configured, start rest period
              state.setIsResting(true);
              state.setMinutesState(restMinutes);
              state.setSecondsState(restSeconds);
            }
          } else {
            controls.resetTimer();
          }
        }
      }
    }, 1000);
    
    intervalStore.current.id = intervalId;
    
    return () => {
      window.clearInterval(intervalId);
    };
  }, [state, controls]);

  useEffect(() => {
    return () => {
      if (intervalStore.current.id) {
        window.clearInterval(intervalStore.current.id);
        intervalStore.current.id = undefined;
      }
    };
  }, []);

  return intervalStore;
};
