
export type TimerTheme = 'black-white' | 'white-black' | 'neon-green' | 'neon-red' | 'neon-pink';

export interface TimerState {
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
  setMinutesState: (min: number) => void;
  setSecondsState: (sec: number) => void;
  setIsRunning: (running: boolean) => void;
  setIsPaused: (paused: boolean) => void;
  setIsMuted: (muted: boolean) => void;
  setCurrentRepetition: (rep: number) => void;
  setTotalRepetitionsState: (reps: number) => void;
  setRestMinutesState: (min: number) => void;
  setRestSecondsState: (sec: number) => void;
  setIsResting: (resting: boolean) => void;
  setThemeState: (theme: TimerTheme) => void;
  pendingTimeUpdateRef: React.MutableRefObject<NodeJS.Timeout | null>;
}

export interface ResetTimerValues {
  minutes: number;
  seconds: number;
  restMinutes: number;
  restSeconds: number;
}

export interface TimerControls {
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => ResetTimerValues;
  timerRef: React.MutableRefObject<{
    workoutMin: number;
    workoutSec: number;
    restMin: number;
    restSec: number;
  }>;
  intervalStore: React.MutableRefObject<{
    id?: number;
  }>;
  pendingTimeUpdateRef: React.RefObject<NodeJS.Timeout>;
  playStartSound: () => void;
  playEndSound: () => void;
  isInResetState?: React.MutableRefObject<boolean>;
  resetIOSSoundState?: () => void;
  registerPlusButton: () => void;
  wasRecentlyPaused?: React.MutableRefObject<boolean>;
}
