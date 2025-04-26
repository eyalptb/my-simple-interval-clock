
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
  // Track click times with longer prevention periods
  const [lastClickTime, setLastClickTime] = useState<number>(0);
  const [lastResetTime, setLastResetTime] = useState<number>(0);
  const [lastStartTime, setLastStartTime] = useState<number>(0);
  const [lastPauseTime, setLastPauseTime] = useState<number>(0);
  const [lastMuteTime, setLastMuteTime] = useState<number>(0);
  
  // Enhanced reset button handler with aggressive iOS prevention
  const handleResetClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Prevent rapid clicking (5 seconds for reset)
    const now = Date.now();
    if (now - lastResetTime < 5000) {
      console.log("Ignored rapid reset click - must wait 5 seconds between resets");
      return;
    }
    
    // Update timestamps
    setLastClickTime(now);
    setLastResetTime(now);
    
    console.log("Reset button clicked - registering silent reset");
    
    // Register reset with AudioService
    AudioService.getInstance().registerReset();
    
    // Call the reset function
    onReset();
  };
  
  // Start button with improved iOS handling
  const handleStart = () => {
    const now = Date.now();
    
    // Global click cooldown
    if (now - lastClickTime < 1000) {
      console.log("Ignored rapid click - global cooldown");
      return;
    }
    
    // Button-specific cooldown (3 seconds)
    if (now - lastStartTime < 3000) {
      console.log("Ignored rapid start click - must wait 3 seconds");
      return;
    }
    
    setLastClickTime(now);
    setLastStartTime(now);
    
    // Prepare audio service for start sound
    AudioService.getInstance().prepareStartSound();
    
    onStart();
  };
  
  // Pause button with rate limiting
  const handlePause = () => {
    const now = Date.now();
    
    // Global click cooldown
    if (now - lastClickTime < 1000) {
      console.log("Ignored rapid click - global cooldown");
      return;
    }
    
    // Button-specific cooldown (2 seconds)
    if (now - lastPauseTime < 2000) {
      console.log("Ignored rapid pause click");
      return;
    }
    
    setLastClickTime(now);
    setLastPauseTime(now);
    
    onPause();
  };
  
  // Mute button
  const handleToggleMute = () => {
    const now = Date.now();
    
    // Global click cooldown
    if (now - lastClickTime < 1000) {
      console.log("Ignored rapid click - global cooldown");
      return;
    }
    
    // Button-specific cooldown (1.5 seconds)
    if (now - lastMuteTime < 1500) {
      console.log("Ignored rapid mute click");
      return;
    }
    
    setLastClickTime(now);
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
