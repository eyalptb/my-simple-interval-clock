
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
  // Track last clicked time to prevent rapid clicks
  const [lastClickTime, setLastClickTime] = useState<number>(0);
  
  // Enhanced reset button handler with additional safeguards
  const handleResetClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Prevent rapid clicking
    const now = Date.now();
    if (now - lastClickTime < 1000) {
      console.log("Ignored rapid reset click");
      return;
    }
    setLastClickTime(now);
    
    console.log("Reset button clicked inside ControlButtons - SILENT RESET");
    
    // Block sounds at service level even more aggressively for iOS
    AudioService.getInstance().blockSoundsTemporarily(5000);
    
    // Force a synchronous reset call
    try {
      onReset();
      console.log("Reset function called successfully - NO SOUNDS");
    } catch (error) {
      console.error("Error during reset:", error);
    }
  };
  
  // Control start with rate limiting
  const handleStart = () => {
    const now = Date.now();
    if (now - lastClickTime < 1000) {
      console.log("Ignored rapid start click");
      return;
    }
    setLastClickTime(now);
    
    // Reset iOS sound state when starting timer to allow start sound
    AudioService.getInstance().resetIOSPlayedState();
    onStart();
  };
  
  // Control pause with rate limiting
  const handlePause = () => {
    const now = Date.now();
    if (now - lastClickTime < 1000) {
      console.log("Ignored rapid pause click");
      return;
    }
    setLastClickTime(now);
    
    onPause();
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
        onClick={onToggleMute}
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
