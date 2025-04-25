
import React from 'react';
import TimeDisplay from '../TimeDisplay';

interface TimeSectionProps {
  title: string;
  isRest: boolean;
  minutes: number;
  seconds: number;
  inputMinutes: number;
  inputSeconds: number;
  isRunning: boolean;
  isPaused: boolean;
  onMinutesChange: (e: React.ChangeEvent<HTMLInputElement>, isRest: boolean) => void;
  onSecondsChange: (e: React.ChangeEvent<HTMLInputElement>, isRest: boolean) => void;
  onIncreaseMinutes: () => void;
  onDecreaseMinutes: () => void;
  onIncreaseSeconds: () => void;
  onDecreaseSeconds: () => void;
}

const TimeSection: React.FC<TimeSectionProps> = ({
  title,
  isRest,
  minutes,
  seconds,
  inputMinutes,
  inputSeconds,
  isRunning,
  isPaused,
  onMinutesChange,
  onSecondsChange,
  onIncreaseMinutes,
  onDecreaseMinutes,
  onIncreaseSeconds,
  onDecreaseSeconds,
}) => {
  return (
    <TimeDisplay
      title={title}
      minutes={minutes}
      seconds={seconds}
      isRest={isRest}
      isRunning={isRunning}
      isPaused={isPaused}
      isEditable={true}
      displayMinutes={inputMinutes}
      displaySeconds={inputSeconds}
      onMinutesChange={onMinutesChange}
      onSecondsChange={onSecondsChange}
      onIncreaseMinutes={onIncreaseMinutes}
      onDecreaseMinutes={onDecreaseMinutes}
      onIncreaseSeconds={onIncreaseSeconds}
      onDecreaseSeconds={onDecreaseSeconds}
    />
  );
};

export default TimeSection;
