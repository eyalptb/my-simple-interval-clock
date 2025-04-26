import React, { useState } from 'react';
import { Play, Pause, Volume, VolumeX, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ControlButtonsProps {
  isRunning: boolean;
  isMuted: boolean;
  canStart: boolean;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onToggleMute: () => void;
}

const ControlButtons: React.FC<ControlButtonsProps> = ({
  isRunning,
  isMuted,
  canStart,
  onStart,
  onPause,
  onReset,
  onToggleMute,
}) => {
  const [lastResetTime, setLastResetTime] = useState<number>(0);
  const [lastMuteTime, setLastMuteTime] = useState<number>(0);
  
  const handleResetClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const now = Date.now();
    if (now - lastResetTime < 5000) {
      console.log("Ignored rapid reset click - must wait 5 seconds between resets");
      return;
    }
    
    setLastResetTime(now);
    onReset();
  };
  
  const handleStart = () => {
    onStart();
  };
  
  const handlePause = () => {
    onPause();
  };
  
  const handleToggleMute = () => {
    const now = Date.now();
    
    if (now - lastMuteTime < 1000) {
      console.log("Ignored rapid mute click");
      return;
    }
    
    setLastMuteTime(now);
    onToggleMute();
  };

  return (
    <div className="flex justify-center space-x-4">
      <Button 
        variant="outline" 
        size="icon"
        onClick={handleResetClick}
        className="rounded-full bg-[#ea384c] hover:bg-[#d1323e] text-white border-none relative group"
        aria-label="Reset timer"
      >
        <RefreshCw className="h-5 w-5" />
      </Button>
      
      {!isRunning ? (
        <Button 
          variant="default" 
          size="icon"
          onClick={handleStart}
          className="rounded-full bg-green-500 hover:bg-green-600"
          disabled={!canStart}
          aria-label="Start timer"
        >
          <Play className="h-5 w-5" />
        </Button>
      ) : (
        <Button 
          variant="default" 
          size="icon"
          onClick={handlePause}
          className="rounded-full bg-amber-500 hover:bg-amber-600"
          aria-label="Pause timer"
        >
          <Pause className="h-5 w-5" />
        </Button>
      )}
      
      <Button 
        variant="outline" 
        size="icon"
        onClick={handleToggleMute}
        className="rounded-full"
        aria-label={isMuted ? "Unmute" : "Mute"}
      >
        {isMuted ? (
          <VolumeX className="h-5 w-5" />
        ) : (
          <Volume className="h-5 w-5" />
        )}
      </Button>
    </div>
  );
};

export default ControlButtons;
