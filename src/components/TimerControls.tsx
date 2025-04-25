
import React from 'react';
import { useTimer } from '@/contexts/TimerContext';
import TimeDisplay from './timer/TimeDisplay';
import ControlButtons from './timer/ControlButtons';
import RepetitionControls from './timer/RepetitionControls';

const TimerControls: React.FC = () => {
  const { 
    startTimer, 
    pauseTimer, 
    resetTimer, 
    isRunning,
    isPaused,
    isMuted,
    toggleMute,
    minutes,
    seconds,
    setMinutes,
    setSeconds,
    totalRepetitions,
    setTotalRepetitions,
    restMinutes,
    restSeconds,
    setRestMinutes,
    setRestSeconds,
    incrementSeconds,
    decrementSeconds,
    incrementMinutes,
    decrementMinutes,
    incrementRestSeconds,
    decrementRestSeconds,
    incrementRestMinutes,
    decrementRestMinutes
  } = useTimer();

  // Store the initial values for input display - these won't change while timer is running
  const [inputMinutes, setInputMinutes] = React.useState(minutes);
  const [inputSeconds, setInputSeconds] = React.useState(seconds);
  const [inputRestMinutes, setInputRestMinutes] = React.useState(restMinutes);
  const [inputRestSeconds, setInputRestSeconds] = React.useState(restSeconds);

  // Only update the input display values when timer is not running and not paused
  React.useEffect(() => {
    if (!isRunning && !isPaused) {
      setInputMinutes(minutes);
      setInputSeconds(seconds);
      setInputRestMinutes(restMinutes);
      setInputRestSeconds(restSeconds);
    }
  }, [minutes, seconds, restMinutes, restSeconds, isRunning, isPaused]);

  const handleMinutesChange = (e: React.ChangeEvent<HTMLInputElement>, isRest: boolean) => {
    const value = parseInt(e.target.value) || 0;
    if (value >= 0 && value <= 99) {
      if (isRest) {
        setRestMinutes(value);
      } else {
        setMinutes(value);
      }
    }
  };

  const handleSecondsChange = (e: React.ChangeEvent<HTMLInputElement>, isRest: boolean) => {
    const value = parseInt(e.target.value) || 0;
    if (isRest) {
      setRestSeconds(value);
    } else {
      setSeconds(value);
    }
  };

  const handleIncreaseReps = () => {
    setTotalRepetitions(Math.min(20, totalRepetitions + 1));
  };

  const handleDecreaseReps = () => {
    setTotalRepetitions(Math.max(1, totalRepetitions - 1));
  };

  return (
    <div className="w-full space-y-6">
      <ControlButtons 
        isRunning={isRunning}
        isMuted={isMuted}
        canStart={minutes > 0 || seconds > 0}
        onStart={startTimer}
        onPause={pauseTimer}
        onReset={resetTimer}
        onToggleMute={toggleMute}
      />
      
      <div className="grid grid-cols-2 gap-4">
        <TimeDisplay
          title="Workout Time"
          minutes={minutes}
          seconds={seconds}
          isRest={false}
          isRunning={isRunning}
          isPaused={isPaused}
          isEditable={true}
          displayMinutes={inputMinutes}
          displaySeconds={inputSeconds}
          onMinutesChange={handleMinutesChange}
          onSecondsChange={handleSecondsChange}
          onIncreaseMinutes={incrementMinutes}
          onDecreaseMinutes={decrementMinutes}
          onIncreaseSeconds={incrementSeconds}
          onDecreaseSeconds={decrementSeconds}
        />
        
        <TimeDisplay
          title="Rest Time"
          minutes={restMinutes}
          seconds={restSeconds}
          isRest={true}
          isRunning={isRunning}
          isPaused={isPaused}
          isEditable={true}
          displayMinutes={inputRestMinutes}
          displaySeconds={inputRestSeconds}
          onMinutesChange={handleMinutesChange}
          onSecondsChange={handleSecondsChange}
          onIncreaseMinutes={incrementRestMinutes}
          onDecreaseMinutes={decrementRestMinutes}
          onIncreaseSeconds={incrementRestSeconds}
          onDecreaseSeconds={decrementRestSeconds}
        />
      </div>
      
      <RepetitionControls
        isRunning={isRunning}
        isPaused={isPaused}
        totalRepetitions={totalRepetitions}
        onIncreaseReps={handleIncreaseReps}
        onDecreaseReps={handleDecreaseReps}
      />
    </div>
  );
};

export default TimerControls;
