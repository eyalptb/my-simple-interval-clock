
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

  // Create audio elements with base64 encoded audio
  useEffect(() => {
    // Create audio elements with embedded short beep and whistle sounds
    const startSound = new Audio();
    startSound.src = 'data:audio/wav;base64,UklGRiYDAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YSIDAAD//p7/nP+q/8D/zv/j//X/+//7//v/9v/z//H/6//j/9n/zv/I/73/sv+r/6j/ov+d/53/pP+p/7L/xf/O/9j/6P/u//P/+//8//n//P////3/+v/2//T/7v/o/9r/yf/E/8D/t/+x/7r/xP/X/+j/+v8GAA8AGQAZABoAGQATAA4ABwAEAAAA//8CAAMAAAD//v/6//f/9//w/+v/5v/i/+P/6v/w//f/AQAGAAYACgAKAAwAGQAqADYARABNAFYAVQBMAD4AKQAWAAcA/P/u/+7/7//z//b//P8DAAwAEwAYAB4AIgAZABYABwD8/+//4v/b/9n/4P/q//P//f8GAAkADQAQAA8ADgAMAAoAAQD1/+3/5f/c/9v/4v/v//v/BAAJAAcAAgADAAAAAf///v/+//z/9v/0//T/9v/7/wAA//8BAP//+v/u/+f/4f/b/9r/4P/l/+7////+//n/8f/o/+L/3v/e/+P/6//z//n////8//j/+P/3//X/9f/z//j/+v////z/+v/2//L/9f/0//b/9v/x//H/7//w//H/8v/y//r//v8AAAAA//8DAAcACAAJAAwACQAGAAIABAAHAAUA+//5//z/AgAGAAQABAAGAAEA/f/8//r/+//6//z/AAABAAMABwAFAAcACQAHAAUABgAGAAIACAAIAAMABQACAAIAAwAAAAAAAgAFAAQABgAFAAQAAgAAAAAAAAD///7//v8AAP//AQACAAIAAAABAAAA/v/9//3/+//8//3//f/+//7///8BAAMABAAAAAIAAgAAAAEAAQABAP7/+//8//3//v8AAP//AgACAAAAAQAAAAIAAwAFAAQABAAFAAUABAAEAAMAAwACAAEAAQAAAP//AgADAAMABAAEAAMAAgACAP//';
    
    const endSound = new Audio();
    endSound.src = 'data:audio/wav;base64,UklGRpAEAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YXAEAAD//////f/9//3//f/9//3//f/9//3//v/+///////9//v/+f/4//j/+P/4//n/+f/5//n/+f/5//n/+f/5//n/+f/5//n/+f/5//n/+v/6//v//P/9///////+//3//P/7//v/+//7//v/+//7//z//P/8//z//P/8//z//P/8//z//P/8//z//P/8//z//f/9//3//f/9//3//v/+///////////////////////+//7//v/+//3//f/8//v/+v/6//n/+f/4//f/9//3//f/9//3//f/9//4//j/+P/5//n/+v/6//v/+//8//z//f/9//7//v////7//v/+//7//v/+//7//f/9//3//P/8//z/+//7//v/+v/6//r/+v/6//r/+v/6//r/+v/7//v/+//7//z//P/8//z//f/9//3//v/+//7////////////+//7//v/+//7//v/9//3//f/8//z/+//7//v/+//7//v/+//7//v/+//7//v/+//7//v/+//7//z//P/8//z//f/9//3//v/+//7//v/+//7//v/+//7//v/+//7//v/+//7//v/+//7//f/9//3//f/9//3//f/9//z//P/8//z//P/8//z//P/8//z//P/8//z//P/8//z//f/9//3//f/9//7//v/+//7//v/+//7//P/8//v/+//7//v/+//7//v/+//7//v/+//7//v//P/8//z//P/8//3//f/9//3//v/+//7//v/+//7//f/9//3//f/9//3//P/8//z//P/8//z//P/8//z//P/8//z//P/8//z//P/8//v/+//7//v/+//7//v/+//7//v/+//7//v/+//8//z//P/8//z//f/9//3//v/+//7//v/+//7//v/+//7//v/+//7//v/+//7//f/9//3//f/9//z//P/8//z//P/8//z//P/8//z//P/8//z//P/8//z//P/8//z//P/8//z//P/8//z//P/9//3//f/9//3//f/9//3//f/+//7//v/+//7//v/+//7//v/+//7//v/+//7//f/9//3//f/9//z//P/8//z//P/8//z//P/8//z//P/8//z//P/8//z//P/8//z//P/8//z//P/8//3//f/9//3//f/+//7//v/+//7//v/+//7//v/+//7//v/+//7//f/9//3//f/9//3//f/9//z//P/8//z//P/8//z//P/8//z//P/8//z//P/8//z//P/9//3//f/9//3//f/9//3//v/+//7//v/+//7//v/+//7//v/+//7//v/+//7//v/+//7//v/+//7//v/+//7//v/+//7//v/+//7//v/9//3//f/9//3//f/9//3//f/9//3//f/9//3//f/9//3//f/9//3//f/9//3//f/9//3//f/9//3//f/+//7//v/+//7//v/+//7//v/+//7//v/+//7//v/+//7//v/+//7//v/+//7//v/+//7//v/+//7//v/+//7//v/+//7//v/+//7//v/+//7//v/+//7//v/+//7//v/+//7//v/+//7/';
    
    // Store the audio elements in our store
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
