
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
  // Track last clicked time with longer prevention periods for each button type
  const [lastClickTime, setLastClickTime] = useState<number>(0);
  const [lastResetTime, setLastResetTime] = useState<number>(0);
  const [lastStartTime, setLastStartTime] = useState<number>(0);
  const [lastPauseTime, setLastPauseTime] = useState<number>(0);
  const [lastMuteTime, setLastMuteTime] = useState<number>(0);
  
  // Enhanced reset button handler with additional safeguards
  const handleResetClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Prevent rapid clicking with more aggressive threshold for reset (3 seconds)
    const now = Date.now();
    if (now - lastResetTime < 3000) {
      console.log("Ignored rapid reset click - must wait 3 seconds between resets");
      return;
    }
    
    // Update all click times to prevent any button clicks right after reset
    setLastClickTime(now);
    setLastResetTime(now);
    setLastStartTime(now);
    setLastPauseTime(now);
    setLastMuteTime(now);
    
    console.log("Reset button clicked inside ControlButtons - SILENT RESET");
    
    // Block sounds at service level even more aggressively for iOS - 10 seconds
    AudioService.getInstance().blockSoundsTemporarily(10000);
    
    // Force a synchronous reset call
    try {
      onReset();
      console.log("Reset function called successfully - NO SOUNDS");
    } catch (error) {
      console.error("Error during reset:", error);
    }
  };
  
  // Control start with aggressive rate limiting
  const handleStart = () => {
    const now = Date.now();
    
    // General click cooldown
    if (now - lastClickTime < 1000) {
      console.log("Ignored rapid click - general cooldown");
      return;
    }
    
    // Button-specific cooldown (2 seconds)
    if (now - lastStartTime < 2000) {
      console.log("Ignored rapid start click - must wait 2 seconds between start clicks");
      return;
    }
    
    // Check if we're in reset cooldown via AudioService
    if (AudioService.getInstance().isWithinResetCooldown()) {
      console.log("Start prevented - still in reset cooldown period");
      return;
    }
    
    setLastClickTime(now);
    setLastStartTime(now);
    
    // Reset iOS sound played state when starting timer to allow start sound
    AudioService.getInstance().resetSpecificIOSSound('start');
    console.log('iOS start sound state reset before starting timer');
    
    onStart();
  };
  
  // Control pause with aggressive rate limiting
  const handlePause = () => {
    const now = Date.now();
    
    // General click cooldown
    if (now - lastClickTime < 1000) {
      console.log("Ignored rapid click - general cooldown");
      return;
    }
    
    // Button-specific cooldown (2 seconds)
    if (now - lastPauseTime < 2000) {
      console.log("Ignored rapid pause click - must wait 2 seconds between pause clicks");
      return;
    }
    
    setLastClickTime(now);
    setLastPauseTime(now);
    
    onPause();
  };
  
  // Control mute with rate limiting
  const handleToggleMute = () => {
    const now = Date.now();
    
    // General click cooldown
    if (now - lastClickTime < 1000) {
      console.log("Ignored rapid click - general cooldown");
      return;
    }
    
    // Button-specific cooldown (1.5 seconds)
    if (now - lastMuteTime < 1500) {
      console.log("Ignored rapid mute click - must wait 1.5 seconds between mute toggles");
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
