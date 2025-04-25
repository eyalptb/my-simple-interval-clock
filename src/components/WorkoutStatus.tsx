
import React from 'react';
import { useTimer } from '@/contexts/TimerContext';

const WorkoutStatus: React.FC = () => {
  const { isResting } = useTimer();
  
  return (
    <div className="flex items-center justify-center mb-2">
      {isResting && (
        <div className="text-lg font-semibold text-yellow-500">
          REST
        </div>
      )}
      {!isResting && (
        <div className="text-lg font-semibold text-green-500">
          WORKOUT
        </div>
      )}
    </div>
  );
};

export default WorkoutStatus;
