
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

  // Ensure we store the original values when the component mounts or values change
  useEffect(() => {
    if (!isRunning && !isResting) {
      // Only update the reference values when not running and not in rest mode
      timerRef.current = {
        workoutMin: minutes,
        workoutSec: seconds,
        restMin: restMinutes,
        restSec: restSeconds
      };
    }
  }, [minutes, seconds, restMinutes, restSeconds, isRunning, isResting]);

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
            
            // Reset to the stored original workout time values
            console.log("After rest: Restoring workout time to", timerRef.current.workoutMin, timerRef.current.workoutSec);
            setMinutesState(timerRef.current.workoutMin);
            setSecondsState(timerRef.current.workoutSec);
            
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
              
              // Reset to the stored original workout time values
              console.log("No rest: Restoring workout time to", timerRef.current.workoutMin, timerRef.current.workoutSec);
              setMinutesState(timerRef.current.workoutMin);
              setSecondsState(timerRef.current.workoutSec);
              
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
  }, [isRunning, minutes, seconds, currentRepetition, totalRepetitions, isResting, isMuted, restMinutes, restSeconds]);

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
