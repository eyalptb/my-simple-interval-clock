
import React, { createContext, useContext, useRef } from 'react';
import { useTimerState } from '@/hooks/useTimerState';
import { useTimerControls } from '@/hooks/useTimerControls';
import { useTimeInputs } from '@/hooks/useTimeInputs';
import { useTimerEffects } from '@/hooks/useTimerEffects';
import { TimerTheme } from '@/types/timer';

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
  const timerState = useTimerState();
  const timerControls = useTimerControls(timerState);
  const { setMinutes, setSeconds, setTotalRepetitions } = useTimeInputs(timerState);
  
  useTimerEffects(timerState, timerControls);

  const toggleMute = () => {
    timerState.setIsMuted(!timerState.isMuted);
  };

  const setTheme = (newTheme: TimerTheme) => {
    timerState.setThemeState(newTheme);
  };
  
  // Fixed and simplified time adjustment functions
  const incrementSeconds = () => {
    if (!timerState.isRunning) {
      if (timerState.seconds === 59) {
        // Correctly handle 0:59 -> 1:00 transition
        const newMinutes = Math.min(99, timerState.minutes + 1);
        setMinutes(newMinutes);
        setSeconds(0);
      } else {
        setSeconds(timerState.seconds + 1);
      }
    }
  };
  
  const decrementSeconds = () => {
    if (!timerState.isRunning) {
      if (timerState.minutes === 0 && timerState.seconds === 0) {
        // Handle 0:00 -> 0:59 transition
        setSeconds(59);
      } else if (timerState.seconds === 0) {
        // Handle 1:00 -> 0:59 transition
        setMinutes(timerState.minutes - 1);
        setSeconds(59);
      } else {
        setSeconds(timerState.seconds - 1);
      }
    }
  };
  
  const incrementMinutes = () => {
    if (!timerState.isRunning && timerState.minutes < 99) {
      setMinutes(timerState.minutes + 1);
    }
  };
  
  const decrementMinutes = () => {
    if (!timerState.isRunning && timerState.minutes > 0) {
      setMinutes(timerState.minutes - 1);
    }
  };
  
  const setRestMinutes = (min: number) => {
    if (!timerState.isRunning) {
      timerState.setRestMinutesState(Math.min(99, Math.max(0, min)));
    }
  };
  
  const setRestSeconds = (sec: number) => {
    if (!timerState.isRunning) {
      if (sec >= 60) {
        const minutesToAdd = Math.floor(sec / 60);
        const remainingSeconds = sec % 60;
        timerState.setRestSecondsState(remainingSeconds);
        timerState.setRestMinutesState(Math.min(99, timerState.restMinutes + minutesToAdd));
        return;
      }
      
      timerState.setRestSecondsState(Math.min(59, Math.max(0, sec)));
    }
  };
  
  // Fixed rest time adjustment functions using the same pattern
  const incrementRestSeconds = () => {
    if (!timerState.isRunning) {
      if (timerState.restSeconds === 59) {
        // Correctly handle 0:59 -> 1:00 transition
        const newMinutes = Math.min(99, timerState.restMinutes + 1);
        setRestMinutes(newMinutes);
        setRestSeconds(0);
      } else {
        setRestSeconds(timerState.restSeconds + 1);
      }
    }
  };
  
  const decrementRestSeconds = () => {
    if (!timerState.isRunning) {
      if (timerState.restMinutes === 0 && timerState.restSeconds === 0) {
        // Handle 0:00 -> 0:59 transition
        setRestSeconds(59);
      } else if (timerState.restSeconds === 0) {
        // Handle 1:00 -> 0:59 transition
        setRestMinutes(timerState.restMinutes - 1);
        setRestSeconds(59);
      } else {
        setRestSeconds(timerState.restSeconds - 1);
      }
    }
  };
  
  const incrementRestMinutes = () => {
    if (!timerState.isRunning && timerState.restMinutes < 99) {
      setRestMinutes(timerState.restMinutes + 1);
    }
  };
  
  const decrementRestMinutes = () => {
    if (!timerState.isRunning && timerState.restMinutes > 0) {
      setRestMinutes(timerState.restMinutes - 1);
    }
  };

  const value: TimerContextType = {
    minutes: timerState.minutes,
    seconds: timerState.seconds,
    isRunning: timerState.isRunning,
    isPaused: timerState.isPaused,
    isMuted: timerState.isMuted,
    currentRepetition: timerState.currentRepetition,
    totalRepetitions: timerState.totalRepetitions,
    restMinutes: timerState.restMinutes,
    restSeconds: timerState.restSeconds,
    isResting: timerState.isResting,
    theme: timerState.theme,
    setMinutes,
    setSeconds,
    setTotalRepetitions,
    setRestMinutes,
    setRestSeconds,
    setTheme,
    toggleMute,
    startTimer: timerControls.startTimer,
    pauseTimer: timerControls.pauseTimer,
    resetTimer: timerControls.resetTimer,
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
