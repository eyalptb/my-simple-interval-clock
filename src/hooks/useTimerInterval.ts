
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
            
            // Set workout time values for next repetition
            state.setMinutesState(controls.timerRef.current.workoutMin);
            state.setSecondsState(controls.timerRef.current.workoutSec);
          } else {
            // Workout completely finished - restore original values instead of resetting to 0
            state.setIsRunning(false);
            state.setIsPaused(false);
            state.setIsResting(false);
            state.setCurrentRepetition(1);
            
            // Set the timer back to the original values instead of resetting to 0
            state.setMinutesState(controls.timerRef.current.workoutMin);
            state.setSecondsState(controls.timerRef.current.workoutSec);
            state.setRestMinutesState(controls.timerRef.current.restMin);
            state.setRestSecondsState(controls.timerRef.current.restSec);
            
            // Clear interval
            window.clearInterval(intervalId);
            intervalStore.current.id = undefined;
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
            // Workout completely finished - restore original values instead of resetting to 0
            state.setIsRunning(false);
            state.setIsPaused(false);
            state.setIsResting(false);
            state.setCurrentRepetition(1);
            
            // Set the timer back to the original values instead of resetting to 0
            state.setMinutesState(controls.timerRef.current.workoutMin);
            state.setSecondsState(controls.timerRef.current.workoutSec);
            state.setRestMinutesState(controls.timerRef.current.restMin);
            state.setRestSecondsState(controls.timerRef.current.restSec);
            
            // Clear interval
            window.clearInterval(intervalId);
            intervalStore.current.id = undefined;
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
