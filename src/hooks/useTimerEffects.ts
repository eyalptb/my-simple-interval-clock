
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

  useEffect(() => {
    if (!isRunning && !isResting) {
      timerRef.current = {
        workoutMin: minutes,
        workoutSec: seconds,
        restMin: restMinutes,
        restSec: restSeconds
      };
    }
  }, [minutes, seconds, restMinutes, restSeconds, isRunning, isResting]);

  useEffect(() => {
    const startSound = new Audio();
    const endSound = new Audio();
    
    startSound.src = '/audio/go.mp3';
    endSound.src = '/audio/whistle.mp3';
    
    // Only show errors when trying to play sounds, not on initial load
    startSound.onerror = () => {
      if (audioStore.current.attemptedToPlay) {
        console.error('Failed to load start sound');
        toast({
          title: 'Audio Error',
          description: 'Could not load start sound',
          variant: 'destructive'
        });
      }
    };

    endSound.onerror = () => {
      if (audioStore.current.attemptedToPlay) {
        console.error('Failed to load end sound');
        toast({
          title: 'Audio Error',
          description: 'Could not load end sound',
          variant: 'destructive'
        });
      }
    };
    
    // Add flag to track if play has been attempted
    audioStore.current.attemptedToPlay = false;
    startSound.load();
    endSound.load();
    
    audioStore.current.startSound = startSound;
    audioStore.current.endSound = endSound;
    
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
        if (!isMuted) {
          const endSound = audioStore.current.endSound;
          if (endSound) {
            endSound.currentTime = 0;
            audioStore.current.attemptedToPlay = true;
            endSound.play().catch(e => console.error('Error playing end sound:', e));
          }
        }
        
        if (isResting) {
          if (currentRepetition < totalRepetitions) {
            setCurrentRepetition(currentRepetition + 1);
            setIsResting(false);
            
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
                audioStore.current.attemptedToPlay = true;
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
                  audioStore.current.attemptedToPlay = true;
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
    
    intervalStore.current.id = intervalId;
    
    return () => {
      window.clearInterval(intervalId);
    };
  }, [isRunning, minutes, seconds, currentRepetition, totalRepetitions, isResting, isMuted, restMinutes, restSeconds]);

  useEffect(() => {
    return () => {
      if (intervalStore.current.id) {
        window.clearInterval(intervalStore.current.id);
        intervalStore.current.id = undefined;
      }
    };
  }, []);
};
