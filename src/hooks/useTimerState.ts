
import { useState, useRef } from 'react';
import { TimerTheme } from '@/types/timer';

export const useTimerState = () => {
  const [minutes, setMinutesState] = useState(0);
  const [seconds, setSecondsState] = useState(40);  // Change to 40 seconds for workout
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentRepetition, setCurrentRepetition] = useState(1);
  const [totalRepetitions, setTotalRepetitionsState] = useState(3);
  const [restMinutes, setRestMinutesState] = useState(1);  // Keep as 1 minute
  const [restSeconds, setRestSecondsState] = useState(0);  // Change to 0 seconds for rest
  const [isResting, setIsResting] = useState(false);
  const [theme, setThemeState] = useState<TimerTheme>('black-white');
  const pendingTimeUpdateRef = useRef<NodeJS.Timeout | null>(null);

  return {
    minutes,
    setMinutesState,
    seconds,
    setSecondsState,
    isRunning,
    setIsRunning,
    isPaused,
    setIsPaused,
    isMuted,
    setIsMuted,
    currentRepetition,
    setCurrentRepetition,
    totalRepetitions,
    setTotalRepetitionsState,
    restMinutes,
    setRestMinutesState,
    restSeconds,
    setRestSecondsState,
    isResting,
    setIsResting,
    theme,
    setThemeState,
    pendingTimeUpdateRef,
  };
};

