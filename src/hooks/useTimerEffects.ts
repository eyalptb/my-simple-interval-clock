
import { useEffect } from 'react';
import { toast } from '@/components/ui/use-toast';
import { TimerState } from '@/types/timer';
import { TimerControls } from '@/types/timer';

export const useTimerEffects = (state: TimerState, controls: TimerControls) => {
  const {
    isRunning,
    minutes,
    seconds,
    currentRepetition,
    totalRepetitions,
    isResting,
    isMuted,
    restMinutes,
    restSeconds,
  } = state;

  const {
    setMinutesState,
    setSecondsState,
    setCurrentRepetition,
    setIsResting,
  } = state;

  const {
    timerRef,
    startSoundRef,
    endSoundRef,
    resetTimer,
    pendingTimeUpdateRef,
    audioStore,
    intervalStore,
  } = controls;

  // Store original workout and rest times to restore them when needed
  const originalWorkoutMin = state.minutes;
  const originalWorkoutSec = state.seconds;
  const originalRestMin = restMinutes;
  const originalRestSec = restSeconds;

  // Create and store audio elements
  useEffect(() => {
    // Create audio elements
    const startSound = new Audio('/go.mp3');
    const endSound = new Audio('/whistle.mp3');
    
    // Store the audio elements in our mutable store
    audioStore.current.startSound = startSound;
    audioStore.current.endSound = endSound;
    
    // Clean up on unmount
    return () => {
      if (intervalStore.current.id) {
        clearInterval(intervalStore.current.id);
        intervalStore.current.id = undefined;
      }
      
      if (pendingTimeUpdateRef.current) {
        clearTimeout(pendingTimeUpdateRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isRunning) return;
    
    const intervalId = window.setInterval(() => {
      if (seconds > 0) {
        setSecondsState(seconds - 1);
      } else if (minutes > 0) {
        setMinutesState(minutes - 1);
        setSecondsState(59);
      } else {
        // Handle end of countdown
        if (!isMuted) {
          const endSound = audioStore.current.endSound;
          if (endSound) {
            endSound.currentTime = 0; // Reset to beginning
            endSound.play().catch(e => console.error('Error playing end sound:', e));
          }
        }
        
        if (isResting) {
          // End of rest period
          if (currentRepetition < totalRepetitions) {
            setCurrentRepetition(currentRepetition + 1);
            setIsResting(false);
            
            // Reset to the original workout time values
            setMinutesState(originalWorkoutMin);
            setSecondsState(originalWorkoutSec);
            
            toast({
              title: `Starting repetition ${currentRepetition + 1} of ${totalRepetitions}`,
              duration: 3000,
            });
            
            if (!isMuted) {
              const startSound = audioStore.current.startSound;
              if (startSound) {
                startSound.currentTime = 0;
                startSound.play().catch(e => console.error('Error playing start sound:', e));
              }
            }
          } else {
            // Workout completed
            resetTimer();
            
            // Make sure workout time is set to original values
            setMinutesState(originalWorkoutMin);
            setSecondsState(originalWorkoutSec);
            
            toast({
              title: "Workout completed!",
              description: `Completed all ${totalRepetitions} repetitions. Great job!`,
              duration: 5000,
            });
          }
        } else {
          // End of workout period
          if (currentRepetition < totalRepetitions) {
            if (restMinutes === 0 && restSeconds === 0) {
              // No rest period configured, go to next repetition
              setCurrentRepetition(currentRepetition + 1);
              
              // Reset to the original workout time values
              setMinutesState(originalWorkoutMin);
              setSecondsState(originalWorkoutSec);
              
              toast({
                title: `Starting repetition ${currentRepetition + 1} of ${totalRepetitions}`,
                duration: 3000,
              });
              
              if (!isMuted) {
                const startSound = audioStore.current.startSound;
                if (startSound) {
                  startSound.currentTime = 0;
                  startSound.play().catch(e => console.error('Error playing start sound:', e));
                }
              }
            } else {
              // Start rest period
              setIsResting(true);
              setMinutesState(restMinutes);
              setSecondsState(restSeconds);
              
              toast({
                title: "Rest period",
                description: `Rest for ${restMinutes}:${restSeconds.toString().padStart(2, '0')}`,
                duration: 3000,
              });
            }
          } else {
            // Last repetition completed
            resetTimer();
            
            // Make sure workout time is set to original values
            setMinutesState(originalWorkoutMin);
            setSecondsState(originalWorkoutSec);
            
            toast({
              title: "Workout completed!",
              description: `Completed all ${totalRepetitions} repetitions. Great job!`,
              duration: 5000,
            });
          }
        }
      }
    }, 1000);
    
    // Store interval ID in our mutable store
    intervalStore.current.id = intervalId;
    
    return () => {
      window.clearInterval(intervalId);
    };
  }, [isRunning, minutes, seconds, currentRepetition, totalRepetitions, isResting, isMuted, restMinutes, restSeconds, originalWorkoutMin, originalWorkoutSec]);

  // Additional effect to clean up intervals on unmount
  useEffect(() => {
    return () => {
      if (intervalStore.current.id) {
        window.clearInterval(intervalStore.current.id);
        intervalStore.current.id = undefined;
      }
    };
  }, []);
};
