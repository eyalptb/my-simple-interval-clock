
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
    isInResetState?: React.MutableRefObject<boolean>; // Add optional isInResetState ref
  }
) => {
  const intervalStore = useRef<{ id?: number }>({});
  // Track if we're in a manual reset operation to prevent sounds
  const isResetOperation = useRef<boolean>(false);
  
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
      // Check if we're in a reset state from any source
      const inResetState = isResetOperation.current || (controls.isInResetState && controls.isInResetState.current);
      
      if (seconds > 0) {
        state.setSecondsState(seconds - 1);
      } else if (minutes > 0) {
        state.setMinutesState(minutes - 1);
        state.setSecondsState(59);
      } else {
        // Timer has reached zero
        
        if (isResting) {
          // Rest period ended - Play start sound for the next workout period
          // Only play if not in a reset operation
          if (!inResetState) {
            controls.playStartSound();
            console.log("Rest ended: Playing GO sound for next workout");
          }
          
          if (currentRepetition < totalRepetitions) {
            state.setCurrentRepetition(currentRepetition + 1);
            state.setIsResting(false);
            
            state.setMinutesState(controls.timerRef.current.workoutMin);
            state.setSecondsState(controls.timerRef.current.workoutSec);
          } else {
            // Workout completely finished
            isResetOperation.current = true;
            controls.resetTimer();
            isResetOperation.current = false;
          }
        } else {
          // Workout period ended - Play end sound
          // Only play if not in a reset operation
          if (!inResetState) {
            controls.playEndSound();
            console.log("Workout ended: Playing WHISTLE sound");
          }
          
          if (currentRepetition < totalRepetitions) {
            if (restMinutes === 0 && restSeconds === 0) {
              // No rest time configured, move directly to next repetition
              state.setCurrentRepetition(currentRepetition + 1);
              
              // Play start sound for the next repetition
              // Only play if not in a reset operation
              if (!inResetState) {
                setTimeout(() => {
                  controls.playStartSound();
                  console.log("No rest period: Playing GO sound for next workout");
                }, 1000); // Small delay between whistle and go sounds
              }
              
              state.setMinutesState(controls.timerRef.current.workoutMin);
              state.setSecondsState(controls.timerRef.current.workoutSec);
            } else {
              // Rest time is configured, start rest period
              state.setIsResting(true);
              state.setMinutesState(restMinutes);
              state.setSecondsState(restSeconds);
            }
          } else {
            isResetOperation.current = true;
            controls.resetTimer();
            isResetOperation.current = false;
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
