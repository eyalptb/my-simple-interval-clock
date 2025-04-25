
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { toast } from '@/components/ui/use-toast';

type TimerTheme = 'black-white' | 'white-black' | 'neon-green' | 'neon-red' | 'neon-pink';

interface TimerContextType {
  minutes: number;
  seconds: number;
  isRunning: boolean;
  isPaused: boolean;
  isMuted: boolean;
  currentRepetition: number;
  totalRepetitions: number;
  restMinutes: number;
  restSeconds: number;
  isResting: boolean;
  theme: TimerTheme;
  setMinutes: (min: number) => void;
  setSeconds: (sec: number) => void;
  setTotalRepetitions: (reps: number) => void;
  setRestMinutes: (min: number) => void;
  setRestSeconds: (sec: number) => void;
  setTheme: (theme: TimerTheme) => void;
  toggleMute: () => void;
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  incrementSeconds: () => void;
  decrementSeconds: () => void;
  incrementMinutes: () => void;
  decrementMinutes: () => void;
  incrementRestSeconds: () => void;
  decrementRestSeconds: () => void;
  incrementRestMinutes: () => void;
  decrementRestMinutes: () => void;
}

const TimerContext = createContext<TimerContextType | undefined>(undefined);

export const useTimer = () => {
  const context = useContext(TimerContext);
  if (context === undefined) {
    throw new Error('useTimer must be used within a TimerProvider');
  }
  return context;
};

export const TimerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [minutes, setMinutesState] = useState(0);
  const [seconds, setSecondsState] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentRepetition, setCurrentRepetition] = useState(1);
  const [totalRepetitions, setTotalRepetitionsState] = useState(3);
  const [restMinutes, setRestMinutesState] = useState(1);
  const [restSeconds, setRestSecondsState] = useState(20);
  const [isResting, setIsResting] = useState(false);
  const [theme, setThemeState] = useState<TimerTheme>('black-white');

  const timerRef = useRef<number | null>(null);
  const startSoundRef = useRef<HTMLAudioElement | null>(null);
  const endSoundRef = useRef<HTMLAudioElement | null>(null);
  const pendingTimeUpdateRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    startSoundRef.current = new Audio('/go.mp3');
    endSoundRef.current = new Audio('/whistle.mp3');
    
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (pendingTimeUpdateRef.current) clearTimeout(pendingTimeUpdateRef.current);
    };
  }, []);

  useEffect(() => {
    if (!isRunning) return;
    
    timerRef.current = window.setInterval(() => {
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
            // Check if rest time is zero (both minutes and seconds)
            if (restMinutes === 0 && restSeconds === 0) {
              // Skip rest period and go directly to the next repetition
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
              // Normal behavior when rest time > 0
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
    
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, minutes, seconds, currentRepetition, totalRepetitions, isResting, isMuted, restMinutes, restSeconds]);

  const startTimer = () => {
    if (!isRunning && (minutes > 0 || seconds > 0)) {
      setIsRunning(true);
      setIsPaused(false);
      if (!isMuted && startSoundRef.current) {
        startSoundRef.current.play().catch(e => console.error('Error playing start sound:', e));
      }
    }
  };

  const pauseTimer = () => {
    if (isRunning) {
      setIsRunning(false);
      setIsPaused(true);
    }
  };

  const resetTimer = () => {
    setIsRunning(false);
    setIsPaused(false);
    setIsResting(false);
    setCurrentRepetition(1);
  };
  
  const setMinutes = (min: number) => {
    if (!isRunning) {
      if (pendingTimeUpdateRef.current) {
        clearTimeout(pendingTimeUpdateRef.current);
      }
      
      const validMin = Math.min(99, Math.max(0, min));
      
      pendingTimeUpdateRef.current = setTimeout(() => {
        setMinutesState(validMin);
        pendingTimeUpdateRef.current = null;
      }, 50);
    }
  };
  
  const setSeconds = (sec: number) => {
    if (!isRunning) {
      if (pendingTimeUpdateRef.current) {
        clearTimeout(pendingTimeUpdateRef.current);
      }
      
      // If seconds are >= 60, convert to minutes and remaining seconds
      if (sec >= 60) {
        const minutesToAdd = Math.floor(sec / 60);
        const remainingSeconds = sec % 60;
        setSecondsState(remainingSeconds);
        setMinutesState(prev => Math.min(99, prev + minutesToAdd));
        return;
      }
      
      // If seconds are < 0, borrow from minutes if available
      if (sec < 0 && minutes > 0) {
        setMinutesState(prev => prev - 1);
        setSecondsState(59);
        return;
      }
      
      const validSec = Math.min(59, Math.max(0, sec));
      
      pendingTimeUpdateRef.current = setTimeout(() => {
        setSecondsState(validSec);
        pendingTimeUpdateRef.current = null;
      }, 50);
    }
  };
  
  const setTotalRepetitions = (reps: number) => {
    if (!isRunning) setTotalRepetitionsState(reps);
  };
  
  const setRestMinutes = (min: number) => {
    if (!isRunning) {
      if (pendingTimeUpdateRef.current) {
        clearTimeout(pendingTimeUpdateRef.current);
      }
      
      const validMin = Math.min(99, Math.max(0, min));
      
      pendingTimeUpdateRef.current = setTimeout(() => {
        setRestMinutesState(validMin);
        pendingTimeUpdateRef.current = null;
      }, 50);
    }
  };
  
  const setRestSeconds = (sec: number) => {
    if (!isRunning) {
      if (pendingTimeUpdateRef.current) {
        clearTimeout(pendingTimeUpdateRef.current);
      }
      
      // If rest seconds are >= 60, convert to minutes and remaining seconds
      if (sec >= 60) {
        const minutesToAdd = Math.floor(sec / 60);
        const remainingSeconds = sec % 60;
        setRestSecondsState(remainingSeconds);
        setRestMinutesState(prev => Math.min(99, prev + minutesToAdd));
        return;
      }
      
      // If seconds are < 0, borrow from minutes if available
      if (sec < 0 && restMinutes > 0) {
        setRestMinutesState(prev => prev - 1);
        setRestSecondsState(59);
        return;
      }
      
      const validSec = Math.min(59, Math.max(0, sec));
      
      pendingTimeUpdateRef.current = setTimeout(() => {
        setRestSecondsState(validSec);
        pendingTimeUpdateRef.current = null;
      }, 50);
    }
  };
  
  const incrementSeconds = () => {
    if (isRunning) return;
    
    if (seconds >= 59) {
      // Handle rollover in a single batch
      setSecondsState(0);
      setMinutesState(prev => Math.min(99, prev + 1));
    } else {
      setSecondsState(prev => prev + 1);
    }
  };
  
  const decrementSeconds = () => {
    if (isRunning) return;
    
    if (seconds === 0) {
      // When at 0 seconds, wrap around to 59 and decrement minute if possible
      if (minutes > 0) {
        setSecondsState(59);
        setMinutesState(prev => prev - 1);
      }
    } else {
      setSecondsState(prev => prev - 1);
    }
  };
  
  const incrementMinutes = () => {
    if (!isRunning) {
      setMinutesState(prev => Math.min(99, prev + 1));
    }
  };
  
  const decrementMinutes = () => {
    if (!isRunning) {
      setMinutesState(prev => Math.max(0, prev - 1));
    }
  };
  
  const incrementRestSeconds = () => {
    if (isRunning) return;
    
    if (restSeconds >= 59) {
      // Handle rollover in a single batch
      setRestSecondsState(0);
      setRestMinutesState(prev => Math.min(99, prev + 1));
    } else {
      setRestSecondsState(prev => prev + 1);
    }
  };
  
  const decrementRestSeconds = () => {
    if (isRunning) return;
    
    if (restSeconds === 0) {
      // When at 0 seconds, wrap around to 59 and decrement minute if possible
      if (restMinutes > 0) {
        setRestSecondsState(59);
        setRestMinutesState(prev => prev - 1);
      }
    } else {
      setRestSecondsState(prev => prev - 1);
    }
  };
  
  const incrementRestMinutes = () => {
    if (!isRunning) {
      setRestMinutesState(prev => Math.min(99, prev + 1));
    }
  };
  
  const decrementRestMinutes = () => {
    if (!isRunning) {
      setRestMinutesState(prev => Math.max(0, prev - 1));
    }
  };
  
  const setTheme = (newTheme: TimerTheme) => {
    setThemeState(newTheme);
  };
  
  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const value = {
    minutes,
    seconds,
    isRunning,
    isPaused,
    isMuted,
    currentRepetition,
    totalRepetitions,
    restMinutes,
    restSeconds,
    isResting,
    theme,
    setMinutes,
    setSeconds,
    setTotalRepetitions,
    setRestMinutes,
    setRestSeconds,
    setTheme,
    toggleMute,
    startTimer,
    pauseTimer,
    resetTimer,
    incrementSeconds,
    decrementSeconds,
    incrementMinutes,
    decrementMinutes,
    incrementRestSeconds,
    decrementRestSeconds,
    incrementRestMinutes,
    decrementRestMinutes,
  };

  return <TimerContext.Provider value={value}>{children}</TimerContext.Provider>;
};
