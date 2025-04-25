
import React, { createContext, useContext } from 'react';
import { useTimerState } from '@/hooks/useTimerState';
import { useTimerControls } from '@/hooks/useTimerControls';
import { useTimerEffects } from '@/hooks/useTimerEffects';
import { useTimeInputs } from '@/hooks/useTimeInputs';
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

  const value = {
    ...timerState,
    ...timerControls,
    setMinutes,
    setSeconds,
    setTotalRepetitions,
    setTheme,
    toggleMute,
  };

  return <TimerContext.Provider value={value}>{children}</TimerContext.Provider>;
};
