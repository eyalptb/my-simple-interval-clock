import React from 'react';
import { useTimer } from '@/contexts/TimerContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Play, 
  Pause, 
  SkipBack,
  Plus, 
  Minus, 
  Bell,
  BellOff,
  Clock, 
  Repeat,
  Volume,
  VolumeX
} from 'lucide-react';

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
    isResting
  } = useTimer();

  const handleIncreaseMinutes = () => {
    setMinutes(Math.min(99, minutes + 1));
  };

  const handleDecreaseMinutes = () => {
    setMinutes(Math.max(0, minutes - 1));
  };

  const handleIncreaseSeconds = () => {
    if (seconds >= 55) {
      setSeconds(0);
      setMinutes(Math.min(99, minutes + 1));
    } else {
      setSeconds(seconds + 5);
    }
  };

  const handleDecreaseSeconds = () => {
    if (seconds <= 0) {
      if (minutes > 0) {
        setSeconds(55);
        setMinutes(minutes - 1);
      }
    } else {
      setSeconds(Math.max(0, seconds - 5));
    }
  };

  const handleIncreaseRestMinutes = () => {
    setRestMinutes(Math.min(99, restMinutes + 1));
  };

  const handleDecreaseRestMinutes = () => {
    setRestMinutes(Math.max(0, restMinutes - 1));
  };

  const handleIncreaseRestSeconds = () => {
    if (restSeconds >= 55) {
      setRestSeconds(0);
      setRestMinutes(Math.min(99, restMinutes + 1));
    } else {
      setRestSeconds(restSeconds + 5);
    }
  };

  const handleDecreaseRestSeconds = () => {
    if (restSeconds <= 0) {
      if (restMinutes > 0) {
        setRestSeconds(55);
        setRestMinutes(restMinutes - 1);
      }
    } else {
      setRestSeconds(Math.max(0, restSeconds - 5));
    }
  };

  const handleIncreaseReps = () => {
    setTotalRepetitions(Math.min(20, totalRepetitions + 1));
  };

  const handleDecreaseReps = () => {
    setTotalRepetitions(Math.max(1, totalRepetitions - 1));
  };

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
    if (value >= 0 && value <= 59) {
      if (isRest) {
        setRestSeconds(value);
      } else {
        setSeconds(value);
      }
    }
  };

  const renderTimeDisplay = (title, mins, secs, isEditable = true, isRest: boolean) => (
    <div className="space-y-2">
      <div className="flex items-center justify-center">
        <Clock className="h-4 w-4 mr-1" />
        <span className="text-sm font-medium">
          {isRest ? "Recess Time" : title}
        </span>
      </div>
      
      <div className="flex justify-between items-center">
        <div className="text-center">
          <span className="text-xs">Min</span>
          <div className="flex flex-col items-center">
            {!isRunning && !isPaused && isEditable ? (
              <Button variant="ghost" size="icon" onClick={!isRest ? handleIncreaseMinutes : handleIncreaseRestMinutes}>
                <Plus className="h-4 w-4" />
              </Button>
            ) : <div className="h-8"></div>}
            
            {!isRunning && !isPaused && isEditable ? (
              <Input
                type="number"
                min="0"
                max="99"
                value={!isRest ? mins : restMinutes}
                onChange={(e) => handleMinutesChange(e, isRest)}
                className="w-12 h-8 text-center p-0"
              />
            ) : (
              <span className="text-lg font-bold">{(!isRest ? mins : restMinutes).toString().padStart(2, '0')}</span>
            )}
            
            {!isRunning && !isPaused && isEditable ? (
              <Button variant="ghost" size="icon" onClick={!isRest ? handleDecreaseMinutes : handleDecreaseRestMinutes}>
                <Minus className="h-4 w-4" />
              </Button>
            ) : <div className="h-8"></div>}
          </div>
        </div>
        
        <span className="text-2xl">:</span>
        
        <div className="text-center">
          <span className="text-xs">Sec</span>
          <div className="flex flex-col items-center">
            {!isRunning && !isPaused && isEditable ? (
              <Button variant="ghost" size="icon" onClick={!isRest ? handleIncreaseSeconds : handleIncreaseRestSeconds}>
                <Plus className="h-4 w-4" />
              </Button>
            ) : <div className="h-8"></div>}
            
            {!isRunning && !isPaused && isEditable ? (
              <Input
                type="number"
                min="0"
                max="59"
                value={!isRest ? secs : restSeconds}
                onChange={(e) => handleSecondsChange(e, isRest)}
                className="w-12 h-8 text-center p-0"
              />
            ) : (
              <span className="text-lg font-bold">{(!isRest ? secs : restSeconds).toString().padStart(2, '0')}</span>
            )}
            
            {!isRunning && !isPaused && isEditable ? (
              <Button variant="ghost" size="icon" onClick={!isRest ? handleDecreaseSeconds : handleDecreaseRestSeconds}>
                <Minus className="h-4 w-4" />
              </Button>
            ) : <div className="h-8"></div>}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full space-y-6">
      <div className="flex justify-center space-x-4">
        <Button 
          variant="outline" 
          size="icon"
          onClick={resetTimer}
          className="rounded-full"
        >
          <SkipBack className="h-5 w-5" />
        </Button>
        
        {!isRunning ? (
          <Button 
            variant="default" 
            size="icon"
            onClick={startTimer}
            className="rounded-full bg-green-500 hover:bg-green-600"
            disabled={minutes === 0 && seconds === 0}
          >
            <Play className="h-5 w-5" />
          </Button>
        ) : (
          <Button 
            variant="default" 
            size="icon"
            onClick={pauseTimer}
            className="rounded-full bg-amber-500 hover:bg-amber-600"
          >
            <Pause className="h-5 w-5" />
          </Button>
        )}
        
        <Button 
          variant="outline" 
          size="icon"
          onClick={toggleMute}
          className="rounded-full"
        >
          {isMuted ? (
            <VolumeX className="h-5 w-5" />
          ) : (
            <Volume className="h-5 w-5" />
          )}
        </Button>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        {renderTimeDisplay("Workout Time", minutes, seconds, true, false)}
        {renderTimeDisplay("", restMinutes, restSeconds, true, true)}
      </div>
      
      {!isRunning && !isPaused && (
        <div className="flex items-center justify-center space-x-4">
          <div className="flex items-center">
            <Repeat className="h-4 w-4 mr-1" />
            <span className="text-sm font-medium">Repetitions</span>
          </div>
          
          <div className="flex items-center">
            <Button variant="outline" size="icon" onClick={handleDecreaseReps}>
              <Minus className="h-4 w-4" />
            </Button>
            <span className="mx-3 text-lg font-bold">{totalRepetitions}</span>
            <Button variant="outline" size="icon" onClick={handleIncreaseReps}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
      
      {(isRunning || isPaused) && (
        <div className="text-center">
          <div className="flex items-center justify-center">
            <Repeat className="h-4 w-4 mr-1" />
            <span className="text-sm font-medium">Repetition {isResting ? "Rest" : "Work"}: {isResting ? "" : ""}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimerControls;
