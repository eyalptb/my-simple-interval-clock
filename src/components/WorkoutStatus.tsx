
import React from 'react';
import { useTimer } from '@/contexts/TimerContext';

const WorkoutStatus: React.FC = () => {
  const { isResting, isRunning } = useTimer();
  
  return (
    <div className="flex items-center justify-center mb-2">
      {!isRunning && (
        <div className="text-lg font-semibold text-primary text-center">
          Every rep brings you closer to the best version of yourself
        </div>
      )}
      {isRunning && !isResting && (
        <div className="text-lg font-semibold text-green-500">
          WORKOUT
        </div>
      )}
      {isRunning && isResting && (
        <div className="text-lg font-semibold text-yellow-500">
          REST
        </div>
      )}
    </div>
  );
};

export default WorkoutStatus;
