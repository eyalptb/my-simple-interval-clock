
import React, { useState } from 'react';
import { Play, Pause, Volume, VolumeX, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AudioService from '@/services/AudioService';

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
  // Track click times with longer prevention periods for reset only
  const [lastResetTime, setLastResetTime] = useState<number>(0);
  const [lastMuteTime, setLastMuteTime] = useState<number>(0);
  
  // Enhanced reset button handler
  const handleResetClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Prevent rapid clicking (5 seconds for reset)
    const now = Date.now();
    if (now - lastResetTime < 5000) {
      console.log("Ignored rapid reset click - must wait 5 seconds between resets");
      return;
    }
    
    // Update timestamp
    setLastResetTime(now);
    
    console.log("Reset button clicked - registering silent reset");
    
    // Register reset with AudioService
    AudioService.getInstance().registerReset();
    
    // Call the reset function
    onReset();
  };
  
  // Start button with no delay
  const handleStart = () => {
    // Prepare audio service for start sound
    AudioService.getInstance().prepareStartSound();
    onStart();
  };
  
  // Pause button with no delay
  const handlePause = () => {
    onPause();
  };
  
  // Mute button with shorter delay
  const handleToggleMute = () => {
    const now = Date.now();
    
    // Button-specific cooldown (1 second)
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
