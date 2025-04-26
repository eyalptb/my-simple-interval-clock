
import React from 'react';
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
  // Enhanced reset button handler with stopPropagation and preventDefault
  const handleResetClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("Reset button clicked inside ControlButtons - SILENT RESET");
    // Force a synchronous reset call
    try {
      onReset();
      console.log("Reset function called successfully - NO SOUNDS");
    } catch (error) {
      console.error("Error during reset:", error);
    }
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
          onClick={onStart}
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
          onClick={onPause}
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
