
import React from 'react';
import { Repeat, Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface RepetitionControlsProps {
  isRunning: boolean;
  isPaused: boolean;
  totalRepetitions: number;
  onIncreaseReps: () => void;
  onDecreaseReps: () => void;
}

const RepetitionControls: React.FC<RepetitionControlsProps> = ({
  isRunning,
  isPaused,
  totalRepetitions,
  onIncreaseReps,
  onDecreaseReps,
}) => {
  if (isRunning || isPaused) {
    return (
      <div className="text-center">
        <div className="flex items-center justify-center">
          <Repeat className="h-4 w-4 mr-1" />
          <span className="text-sm font-medium">Repetition Work</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center space-x-4">
      <div className="flex items-center">
        <Repeat className="h-4 w-4 mr-1" />
        <span className="text-sm font-medium">Repetitions</span>
      </div>
      
      <div className="flex items-center">
        <Button variant="outline" size="icon" onClick={onDecreaseReps}>
          <Minus className="h-4 w-4" />
        </Button>
        <span className="mx-3 text-lg font-bold">{totalRepetitions}</span>
        <Button variant="outline" size="icon" onClick={onIncreaseReps}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default RepetitionControls;
