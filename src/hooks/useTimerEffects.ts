
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

  useEffect(() => {
    // We'll create new audio elements but won't assign to .current directly
    // because the refs are read-only
    const startSound = new Audio('/go.mp3');
    const endSound = new Audio('/whistle.mp3');
    
    // Store references in a way that doesn't use .current assignment
    if (startSoundRef && 'current' in startSoundRef) {
      // Using a type assertion to work around the readonly issue
      (startSoundRef as { current: HTMLAudioElement | null }).current = startSound;
    }
    if (endSoundRef && 'current' in endSoundRef) {
      (endSoundRef as { current: HTMLAudioElement | null }).current = endSound;
    }
    
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (pendingTimeUpdateRef.current) clearTimeout(pendingTimeUpdateRef.current);
    };
  }, []);

  useEffect(() => {
    if (!isRunning) return;
    
    // Using window.setInterval and storing the ID
    const intervalId = window.setInterval(() => {
      if (seconds > 0) {
        setSecondsState(seconds - 1);
      } else if (minutes > 0) {
        setMinutesState(minutes - 1);
        setSecondsState(59);
      } else {
        if (!isMuted && endSoundRef.current) {
          endSoundRef.current.play().catch(e => console.error('Error playing end sound:', e));
        }
        
        if (isResting) {
          if (currentRepetition < totalRepetitions) {
            setCurrentRepetition(currentRepetition + 1);
            setIsResting(false);
            setMinutesState(minutes);
            setSecondsState(seconds);
            
            toast({
              title: `Starting repetition ${currentRepetition + 1} of ${totalRepetitions}`,
              duration: 3000,
            });
            
            if (!isMuted && startSoundRef.current) {
              startSoundRef.current.play().catch(e => console.error('Error playing start sound:', e));
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
              setMinutesState(minutes);
              setSecondsState(seconds);
              
              toast({
                title: `Starting repetition ${currentRepetition + 1} of ${totalRepetitions}`,
                duration: 3000,
              });
              
              if (!isMuted && startSoundRef.current) {
                startSoundRef.current.play().catch(e => console.error('Error playing start sound:', e));
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
    
    // Store the interval ID safely using a type assertion
    if (timerRef && 'current' in timerRef) {
      (timerRef as { current: number | null }).current = intervalId;
    }
    
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, minutes, seconds, currentRepetition, totalRepetitions, isResting, isMuted, restMinutes, restSeconds]);
};
