
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
  const [seconds, setSecondsState] = useState(40);
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

  // Initialize audio elements
  useEffect(() => {
    startSoundRef.current = new Audio('/go.mp3');
    endSoundRef.current = new Audio('/whistle.mp3');
    
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Timer logic
  useEffect(() => {
    if (!isRunning) return;
    
    timerRef.current = window.setInterval(() => {
      if (seconds > 0) {
        setSecondsState(seconds - 1);
      } else if (minutes > 0) {
        setMinutesState(minutes - 1);
        setSecondsState(59);
      } else {
        // Timer completed
        if (!isMuted && endSoundRef.current) {
          endSoundRef.current.play().catch(e => console.error('Error playing end sound:', e));
        }
        
        if (isResting) {
          // Rest period completed
          if (currentRepetition < totalRepetitions) {
            // Start next workout interval
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
            // Workout completed
            resetTimer();
            toast({
              title: "Workout completed!",
              description: `Completed all ${totalRepetitions} repetitions. Great job!`,
              duration: 5000,
            });
          }
        } else {
          // Work period completed, start rest if not the last repetition
          if (currentRepetition < totalRepetitions) {
            setIsResting(true);
            setMinutesState(restMinutes);
            setSecondsState(restSeconds);
            
            toast({
              title: "Rest period",
              description: `Rest for ${restMinutes}:${restSeconds.toString().padStart(2, '0')}`,
              duration: 3000,
            });
          } else {
            // Final work period completed
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
    if (!isRunning) setMinutesState(min);
  };
  
  const setSeconds = (sec: number) => {
    if (!isRunning) setSecondsState(sec);
  };
  
  const setTotalRepetitions = (reps: number) => {
    if (!isRunning) setTotalRepetitionsState(reps);
  };
  
  const setRestMinutes = (min: number) => {
    if (!isRunning) setRestMinutesState(min);
  };
  
  const setRestSeconds = (sec: number) => {
    if (!isRunning) setRestSecondsState(sec);
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
  };

  return <TimerContext.Provider value={value}>{children}</TimerContext.Provider>;
};
