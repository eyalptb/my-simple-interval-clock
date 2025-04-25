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
  return (
    <div className="flex justify-center space-x-4">
      <Button 
        variant="outline" 
        size="icon"
        onClick={onReset}
        className="rounded-full bg-[#ea384c] hover:bg-[#d1323e] text-white border-none relative group"
      >
        <RefreshCw className="h-8 w-8 group-hover:text-white" />
        <span className="absolute font-bold text-sm group-hover:text-white">R</span>
      </Button>
      
      {!isRunning ? (
        <Button 
          variant="default" 
          size="icon"
          onClick={onStart}
          className="rounded-full bg-green-500 hover:bg-green-600"
          disabled={!canStart}
        >
          <Play className="h-5 w-5" />
        </Button>
      ) : (
        <Button 
          variant="default" 
          size="icon"
          onClick={onPause}
          className="rounded-full bg-amber-500 hover:bg-amber-600"
        >
          <Pause className="h-5 w-5" />
        </Button>
      )}
      
      <Button 
        variant="outline" 
        size="icon"
        onClick={onToggleMute}
        className="rounded-full"
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
