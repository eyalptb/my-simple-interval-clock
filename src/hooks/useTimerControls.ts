
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
    
    // Reset all timer values to zero instead of restoring from timerRef
    console.log("Reset timer: Setting all values to 0");
    state.setMinutesState(0);
    state.setSecondsState(0);
    state.setRestMinutesState(0);
    state.setRestSecondsState(0);
    
    // Also update the timerRef to zeros so that future resets will use these values
    timerRef.current = {
      workoutMin: 0,
      workoutSec: 0,
      restMin: 0,
      restSec: 0
    };
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
