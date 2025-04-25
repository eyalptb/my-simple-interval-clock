
import { useEffect, useRef } from 'react';
import { toast } from '@/hooks/use-toast';
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
      if (seconds > 0) {
        state.setSecondsState(seconds - 1);
      } else if (minutes > 0) {
        state.setMinutesState(minutes - 1);
        state.setSecondsState(59);
      } else {
        controls.playEndSound();
        
        if (isResting) {
          if (currentRepetition < totalRepetitions) {
            state.setCurrentRepetition(currentRepetition + 1);
            state.setIsResting(false);
            
            state.setMinutesState(controls.timerRef.current.workoutMin);
            state.setSecondsState(controls.timerRef.current.workoutSec);
            
            toast({
              title: `Starting repetition ${currentRepetition + 1} of ${totalRepetitions}`,
              duration: 3000,
            });
            
            controls.playStartSound();
          } else {
            controls.resetTimer();
            
            toast({
              title: "Workout completed!",
              description: `Completed all ${totalRepetitions} repetitions. Great job!`,
              duration: 5000,
            });
          }
        } else {
          if (currentRepetition < totalRepetitions) {
            if (restMinutes === 0 && restSeconds === 0) {
              state.setCurrentRepetition(currentRepetition + 1);
              
              state.setMinutesState(controls.timerRef.current.workoutMin);
              state.setSecondsState(controls.timerRef.current.workoutSec);
              
              toast({
                title: `Starting repetition ${currentRepetition + 1} of ${totalRepetitions}`,
                duration: 3000,
              });
              
              controls.playStartSound();
            } else {
              state.setIsResting(true);
              state.setMinutesState(restMinutes);
              state.setSecondsState(restSeconds);
              
              toast({
                title: "Rest period",
                description: `Rest for ${restMinutes}:${restSeconds.toString().padStart(2, '0')}`,
                duration: 3000,
              });
            }
          } else {
            controls.resetTimer();
            
            toast({
              title: "Workout completed!",
              description: `Completed all ${totalRepetitions} repetitions. Great job!`,
              duration: 5000,
            });
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
