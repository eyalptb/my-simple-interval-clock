
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
    isInResetState?: React.MutableRefObject<boolean>;
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
      // Only check global mute, remove reset sound blocking
      const inResetState = false;
      
      if (seconds > 0) {
        state.setSecondsState(seconds - 1);
      } else if (minutes > 0) {
        state.setMinutesState(minutes - 1);
        state.setSecondsState(59);
      } else {
        // Timer has reached zero
        
        if (isResting) {
          // Rest period ended - Play start sound for the next workout period
          controls.playStartSound();
          console.log("Rest ended: Playing GO sound for next workout");
          
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
          // Workout period ended - ALWAYS play end sound (whistle)
          controls.playEndSound();
          console.log("Workout ended: Playing WHISTLE sound - GUARANTEED");
          
          if (currentRepetition < totalRepetitions) {
            if (restMinutes === 0 && restSeconds === 0) {
              // No rest time configured, move directly to next repetition
              state.setCurrentRepetition(currentRepetition + 1);
              
              // Play start sound for the next repetition with delay
              setTimeout(() => {
                controls.playStartSound();
                console.log("No rest period: Playing GO sound for next workout");
              }, 1500); // Increased delay to ensure whistle is heard
              
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
