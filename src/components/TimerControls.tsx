
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
    decrementRestMinutes,
    isResting,
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
        setInputRestMinutes(value);
      } else {
        setMinutes(value);
        setInputMinutes(value);
      }
    }
  };

  const handleSecondsChange = (e: React.ChangeEvent<HTMLInputElement>, isRest: boolean) => {
    const value = parseInt(e.target.value) || 0;
    if (value >= 0 && value <= 59) {
      if (isRest) {
        setRestSeconds(value);
        setInputRestSeconds(value);
      } else {
        setSeconds(value);
        setInputSeconds(value);
      }
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
          onIncreaseMinutes={() => {
            incrementMinutes();
            if (!isRunning && !isPaused) {
              setInputMinutes(prev => Math.min(99, prev + 1));
            }
          }}
          onDecreaseMinutes={() => {
            decrementMinutes();
            if (!isRunning && !isPaused) {
              setInputMinutes(prev => Math.max(0, prev - 1));
            }
          }}
          onIncreaseSeconds={() => {
            incrementSeconds();
            if (!isRunning && !isPaused) {
              if (inputSeconds === 59) {
                setInputSeconds(0);
                setInputMinutes(prev => Math.min(99, prev + 1));
              } else {
                setInputSeconds(prev => prev + 1);
              }
            }
          }}
          onDecreaseSeconds={() => {
            decrementSeconds();
            if (!isRunning && !isPaused) {
              if (inputSeconds === 0 && inputMinutes > 0) {
                setInputSeconds(59);
                setInputMinutes(prev => prev - 1);
              } else if (inputSeconds > 0) {
                setInputSeconds(prev => prev - 1);
              }
            }
          }}
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
          onIncreaseMinutes={() => {
            incrementRestMinutes();
            if (!isRunning && !isPaused) {
              setInputRestMinutes(prev => Math.min(99, prev + 1));
            }
          }}
          onDecreaseMinutes={() => {
            decrementRestMinutes();
            if (!isRunning && !isPaused) {
              setInputRestMinutes(prev => Math.max(0, prev - 1));
            }
          }}
          onIncreaseSeconds={() => {
            incrementRestSeconds();
            if (!isRunning && !isPaused) {
              if (inputRestSeconds === 59) {
                setInputRestSeconds(0);
                setInputRestMinutes(prev => Math.min(99, prev + 1));
              } else {
                setInputRestSeconds(prev => prev + 1);
              }
            }
          }}
          onDecreaseSeconds={() => {
            decrementRestSeconds();
            if (!isRunning && !isPaused) {
              if (inputRestSeconds === 0 && inputRestMinutes > 0) {
                setInputRestSeconds(59);
                setInputRestMinutes(prev => prev - 1);
              } else if (inputRestSeconds > 0) {
                setInputRestSeconds(prev => prev - 1);
              }
            }
          }}
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
