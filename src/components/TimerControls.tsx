
import React, { useEffect } from 'react';
import { useTimer } from '@/contexts/TimerContext';
import ControlButtons from './timer/ControlButtons';
import RepetitionControls from './timer/RepetitionControls';
import TimeSections from './timer/controls/TimeSections';
import { ResetTimerValues } from '@/types/timer';

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
    registerPlusButton
  } = useTimer();

  // Store input values - these should be the configured values, not the running countdown
  const [inputMinutes, setInputMinutes] = React.useState(minutes);
  const [inputSeconds, setInputSeconds] = React.useState(seconds);
  const [inputRestMinutes, setInputRestMinutes] = React.useState(restMinutes);
  const [inputRestSeconds, setInputRestSeconds] = React.useState(restSeconds);

  // Update input display values when timer state changes and timer is not running
  React.useEffect(() => {
    if (!isRunning && !isPaused) {
      setInputMinutes(minutes);
      setInputSeconds(seconds);
      setInputRestMinutes(restMinutes);
      setInputRestSeconds(restSeconds);
      
      console.log("Input values updated:", {
        inputMinutes: minutes,
        inputSeconds: seconds,
        inputRestMinutes: restMinutes,
        inputRestSeconds: restSeconds
      });
    }
  }, [minutes, seconds, restMinutes, restSeconds, isRunning, isPaused]);

  // Input handlers
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

  // Super responsive button handlers - no delay
  const handleIncreaseMinutes = () => {
    incrementMinutes();
    registerPlusButton();
  };
  
  const handleDecreaseMinutes = () => {
    decrementMinutes();
  };
  
  const handleIncreaseSeconds = () => {
    incrementSeconds();
    registerPlusButton();
  };
  
  const handleDecreaseSeconds = () => {
    decrementSeconds();
  };
  
  const handleIncreaseRestMinutes = () => {
    incrementRestMinutes();
    registerPlusButton();
  };
  
  const handleDecreaseRestMinutes = () => {
    decrementRestMinutes();
  };
  
  const handleIncreaseRestSeconds = () => {
    incrementRestSeconds();
    registerPlusButton();
  };
  
  const handleDecreaseRestSeconds = () => {
    decrementRestSeconds();
  };

  const handleIncreaseReps = () => {
    setTotalRepetitions(Math.min(20, totalRepetitions + 1));
  };

  const handleDecreaseReps = () => {
    setTotalRepetitions(Math.max(1, totalRepetitions - 1));
  };

  // Enhanced reset handler with proper error handling
  const handleReset = () => {
    console.log("Reset button clicked in TimerControls");
    
    try {
      const resetValues: ResetTimerValues = resetTimer();
      
      // Force immediate UI update
      setInputMinutes(0);
      setInputSeconds(0);
      setInputRestMinutes(0);
      setInputRestSeconds(0);
    } catch (error) {
      console.error("Error in reset handler:", error);
    }
  };

  return (
    <div className="w-full space-y-6">
      <ControlButtons 
        isRunning={isRunning}
        isMuted={isMuted}
        canStart={minutes > 0 || seconds > 0 || isPaused}
        onStart={startTimer}
        onPause={pauseTimer}
        onReset={handleReset}
        onToggleMute={toggleMute}
      />
      
      <TimeSections
        minutes={minutes}
        seconds={seconds}
        restMinutes={restMinutes}
        restSeconds={restSeconds}
        inputMinutes={inputMinutes}
        inputSeconds={inputSeconds}
        inputRestMinutes={inputRestMinutes}
        inputRestSeconds={inputRestSeconds}
        isRunning={isRunning}
        isPaused={isPaused}
        onMinutesChange={handleMinutesChange}
        onSecondsChange={handleSecondsChange}
        onIncreaseMinutes={handleIncreaseMinutes}
        onDecreaseMinutes={handleDecreaseMinutes}
        onIncreaseSeconds={handleIncreaseSeconds}
        onDecreaseSeconds={handleDecreaseSeconds}
        onIncreaseRestMinutes={handleIncreaseRestMinutes}
        onDecreaseRestMinutes={handleDecreaseRestMinutes}
        onIncreaseRestSeconds={handleIncreaseRestSeconds}
        onDecreaseRestSeconds={handleDecreaseRestSeconds}
      />
      
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
