
import React from 'react';
import TimeSection from './TimeSection';

interface TimeSectionsProps {
  minutes: number;
  seconds: number;
  restMinutes: number;
  restSeconds: number;
  inputMinutes: number;
  inputSeconds: number;
  inputRestMinutes: number;
  inputRestSeconds: number;
  isRunning: boolean;
  isPaused: boolean;
  onMinutesChange: (e: React.ChangeEvent<HTMLInputElement>, isRest: boolean) => void;
  onSecondsChange: (e: React.ChangeEvent<HTMLInputElement>, isRest: boolean) => void;
  onIncreaseMinutes: () => void;
  onDecreaseMinutes: () => void;
  onIncreaseSeconds: () => void;
  onDecreaseSeconds: () => void;
  onIncreaseRestMinutes: () => void;
  onDecreaseRestMinutes: () => void;
  onIncreaseRestSeconds: () => void;
  onDecreaseRestSeconds: () => void;
}

const TimeSections: React.FC<TimeSectionsProps> = ({
  minutes,
  seconds,
  restMinutes,
  restSeconds,
  inputMinutes,
  inputSeconds,
  inputRestMinutes,
  inputRestSeconds,
  isRunning,
  isPaused,
  onMinutesChange,
  onSecondsChange,
  onIncreaseMinutes,
  onDecreaseMinutes,
  onIncreaseSeconds,
  onDecreaseSeconds,
  onIncreaseRestMinutes,
  onDecreaseRestMinutes,
  onIncreaseRestSeconds,
  onDecreaseRestSeconds,
}) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <TimeSection
        title="Workout Time"
        isRest={false}
        minutes={minutes}
        seconds={seconds}
        inputMinutes={inputMinutes}
        inputSeconds={inputSeconds}
        isRunning={isRunning}
        isPaused={isPaused}
        onMinutesChange={onMinutesChange}
        onSecondsChange={onSecondsChange}
        onIncreaseMinutes={onIncreaseMinutes}
        onDecreaseMinutes={onDecreaseMinutes}
        onIncreaseSeconds={onIncreaseSeconds}
        onDecreaseSeconds={onDecreaseSeconds}
      />
      
      <TimeSection
        title="Rest Time"
        isRest={true}
        minutes={restMinutes}
        seconds={restSeconds}
        inputMinutes={inputRestMinutes}
        inputSeconds={inputRestSeconds}
        isRunning={isRunning}
        isPaused={isPaused}
        onMinutesChange={onMinutesChange}
        onSecondsChange={onSecondsChange}
        onIncreaseMinutes={onIncreaseRestMinutes}
        onDecreaseMinutes={onDecreaseRestMinutes}
        onIncreaseSeconds={onIncreaseRestSeconds}
        onDecreaseSeconds={onDecreaseRestSeconds}
      />
    </div>
  );
};

export default TimeSections;
