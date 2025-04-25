
import { useRef } from 'react';
import { TimerState } from '@/types/timer';

export const useTimerControls = (state: TimerState) => {
  const {
    setIsRunning,
    setIsPaused,
    setIsResting,
    setCurrentRepetition,
    isMuted,
    minutes,
    seconds,
  } = state;

  // Create refs for audio and timer settings
  const startSoundRef = useRef<HTMLAudioElement | null>(null);
  const endSoundRef = useRef<HTMLAudioElement | null>(null);
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

  // Store audio elements and interval ID in these objects
  const audioStore = useRef<{ startSound?: HTMLAudioElement, endSound?: HTMLAudioElement }>({});
  const intervalStore = useRef<{ id?: number }>({});

  const startTimer = () => {
    if (!state.isRunning && (minutes > 0 || seconds > 0)) {
      // Update timer reference with current values before starting
      if (!state.isResting) {
        timerRef.current = {
          workoutMin: minutes,
          workoutSec: seconds,
          restMin: state.restMinutes,
          restSec: state.restSeconds
        };
        console.log("Start timer: Storing workout time", minutes, seconds);
      }
      
      setIsRunning(true);
      setIsPaused(false);
      if (!isMuted) {
        // Access the audio through our store
        const startSound = audioStore.current.startSound;
        if (startSound) {
          startSound.currentTime = 0; // Reset to beginning
          startSound.play().catch(e => console.error('Error playing start sound:', e));
        }
      }
    }
  };

  const pauseTimer = () => {
    if (state.isRunning) {
      setIsRunning(false);
      setIsPaused(true);
      
      // Clear interval using our store
      if (intervalStore.current.id) {
        window.clearInterval(intervalStore.current.id);
      }
    }
  };

  const resetTimer = () => {
    // Clear interval using our store
    if (intervalStore.current.id) {
      window.clearInterval(intervalStore.current.id);
      intervalStore.current.id = undefined;
    }
    
    setIsRunning(false);
    setIsPaused(false);
    setIsResting(false);
    setCurrentRepetition(1);
    
    // Restore original timer values from the ref
    console.log("Reset timer: Restoring to", timerRef.current.workoutMin, timerRef.current.workoutSec);
    state.setMinutesState(timerRef.current.workoutMin);
    state.setSecondsState(timerRef.current.workoutSec);
  };

  return {
    startTimer,
    pauseTimer,
    resetTimer,
    startSoundRef,
    endSoundRef,
    timerRef,
    audioStore,
    intervalStore,
    pendingTimeUpdateRef: state.pendingTimeUpdateRef,
  };
};
