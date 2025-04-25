
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
  } = controls;

  // Store original workout and rest times to restore them when needed
  const originalWorkoutMin = state.minutes;
  const originalWorkoutSec = state.seconds;
  const originalRestMin = restMinutes;
  const originalRestSec = restSeconds;

  useEffect(() => {
    // Create audio elements without directly assigning to read-only refs
    const startSound = new Audio('/go.mp3');
    const endSound = new Audio('/whistle.mp3');
    
    // Store the audio elements for later reference
    if (startSoundRef) {
      // Use a mutable object property instead of the read-only 'current'
      (startSoundRef as any)._audio = startSound;
    }
    
    if (endSoundRef) {
      (endSoundRef as any)._audio = endSound;
    }
    
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (pendingTimeUpdateRef.current) clearTimeout(pendingTimeUpdateRef.current);
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
        if (!isMuted && endSoundRef) {
          const endSound = (endSoundRef as any)._audio;
          if (endSound) {
            endSound.play().catch(e => console.error('Error playing end sound:', e));
          }
        }
        
        if (isResting) {
          if (currentRepetition < totalRepetitions) {
            setCurrentRepetition(currentRepetition + 1);
            setIsResting(false);
            
            // Always reset to the original workout time values
            setMinutesState(originalWorkoutMin);
            setSecondsState(originalWorkoutSec);
            
            toast({
              title: `Starting repetition ${currentRepetition + 1} of ${totalRepetitions}`,
              duration: 3000,
            });
            
            if (!isMuted && startSoundRef) {
              const startSound = (startSoundRef as any)._audio;
              if (startSound) {
                startSound.play().catch(e => console.error('Error playing start sound:', e));
              }
            }
          } else {
            resetTimer();
            toast({
              title: "Workout completed!",
              description: `Completed all ${totalRepetitions} repetitions. Great job!`,
              duration: 5000,
            });
          }
        } else {
          if (currentRepetition < totalRepetitions) {
            if (restMinutes === 0 && restSeconds === 0) {
              setCurrentRepetition(currentRepetition + 1);
              
              // Always reset to the original workout time values
              setMinutesState(originalWorkoutMin);
              setSecondsState(originalWorkoutSec);
              
              toast({
                title: `Starting repetition ${currentRepetition + 1} of ${totalRepetitions}`,
                duration: 3000,
              });
              
              if (!isMuted && startSoundRef) {
                const startSound = (startSoundRef as any)._audio;
                if (startSound) {
                  startSound.play().catch(e => console.error('Error playing start sound:', e));
                }
              }
            } else {
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
    
    // Store interval ID without directly assigning to read-only ref
    // Using a workaround with the window object
    window.clearInterval(timerRef.current || 0);
    (window as any)._timerRefId = intervalId;
    (timerRef as any)._intervalId = intervalId;
    
    return () => {
      window.clearInterval(intervalId);
    };
  }, [isRunning, minutes, seconds, currentRepetition, totalRepetitions, isResting, isMuted, restMinutes, restSeconds, originalWorkoutMin, originalWorkoutSec]);

  // Additional effect to sync the timer ref with our stored ID
  useEffect(() => {
    return () => {
      if ((timerRef as any)._intervalId) {
        window.clearInterval((timerRef as any)._intervalId);
      }
    };
  }, []);
};
