
import React from 'react';
import { Clock, Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface TimeDisplayProps {
  title: string;
  minutes: number;
  seconds: number;
  isRest: boolean;
  isRunning: boolean;
  isPaused: boolean;
  isEditable: boolean;
  displayMinutes: number;
  displaySeconds: number;
  onMinutesChange: (e: React.ChangeEvent<HTMLInputElement>, isRest: boolean) => void;
  onSecondsChange: (e: React.ChangeEvent<HTMLInputElement>, isRest: boolean) => void;
  onIncreaseMinutes: () => void;
  onDecreaseMinutes: () => void;
  onIncreaseSeconds: () => void;
  onDecreaseSeconds: () => void;
}

const TimeDisplay: React.FC<TimeDisplayProps> = ({
  title,
  minutes,
  seconds,
  isRest,
  isRunning,
  isPaused,
  isEditable,
  displayMinutes,
  displaySeconds,
  onMinutesChange,
  onSecondsChange,
  onIncreaseMinutes,
  onDecreaseMinutes,
  onIncreaseSeconds,
  onDecreaseSeconds,
}) => {
  // Display title with appropriate label based on whether it's rest or workout
  const displayTitle = isRest ? "Rest Time" : title;
  
  // Show display values when editing, show running values when timer is active
  // This ensures the original values don't change during runtime
  const showMinutes = (isRunning || isPaused) && isRest === true ? minutes : displayMinutes;
  const showSeconds = (isRunning || isPaused) && isRest === true ? seconds : displaySeconds;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-center">
        <Clock className="h-4 w-4 mr-1" />
        <span className="text-sm font-medium">{displayTitle}</span>
      </div>
      
      <div className="flex justify-between items-center">
        <div className="text-center">
          <span className="text-xs">Min</span>
          <div className="flex flex-col items-center">
            {!isRunning && !isPaused && isEditable ? (
              <Button variant="ghost" size="icon" onClick={onIncreaseMinutes}>
                <Plus className="h-4 w-4" />
              </Button>
            ) : <div className="h-8"></div>}
            
            <div className="h-8 flex items-center justify-center">
              {!isRunning && !isPaused && isEditable ? (
                <Input
                  type="number"
                  min="0"
                  max="99"
                  value={displayMinutes}
                  onChange={(e) => onMinutesChange(e, isRest)}
                  className="w-12 h-8 text-center p-0"
                />
              ) : (
                <span className="text-lg font-bold">
                  {showMinutes.toString().padStart(2, '0')}
                </span>
              )}
            </div>
            
            {!isRunning && !isPaused && isEditable ? (
              <Button variant="ghost" size="icon" onClick={onDecreaseMinutes}>
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
              <Button variant="ghost" size="icon" onClick={onIncreaseSeconds}>
                <Plus className="h-4 w-4" />
              </Button>
            ) : <div className="h-8"></div>}
            
            <div className="h-8 flex items-center justify-center">
              {!isRunning && !isPaused && isEditable ? (
                <Input
                  type="number"
                  min="0"
                  max="59"
                  value={displaySeconds}
                  onChange={(e) => onSecondsChange(e, isRest)}
                  className="w-12 h-8 text-center p-0"
                />
              ) : (
                <span className="text-lg font-bold">
                  {showSeconds.toString().padStart(2, '0')}
                </span>
              )}
            </div>
            
            {!isRunning && !isPaused && isEditable ? (
              <Button variant="ghost" size="icon" onClick={onDecreaseSeconds}>
                <Minus className="h-4 w-4" />
              </Button>
            ) : <div className="h-8"></div>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimeDisplay;
