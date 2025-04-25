
import React from 'react';
import FlipCard from './FlipCard';
import { useTimer } from '@/contexts/TimerContext';

const FlipClock: React.FC = () => {
  const { minutes, seconds } = useTimer();
  
  // Format minutes and seconds to double digits
  const formattedMinutes = String(minutes).padStart(2, '0');
  const formattedSeconds = String(seconds).padStart(2, '0');
  
  return (
    <div className="w-full">
      <div className="flex items-center justify-center gap-1">
        <div className="flex-1 aspect-square max-w-24">
          <FlipCard digit={formattedMinutes[0]} />
        </div>
        <div className="flex-1 aspect-square max-w-24">
          <FlipCard digit={formattedMinutes[1]} />
        </div>
        
        <div className="text-3xl font-bold mx-2">:</div>
        
        <div className="flex-1 aspect-square max-w-24">
          <FlipCard digit={formattedSeconds[0]} />
        </div>
        <div className="flex-1 aspect-square max-w-24">
          <FlipCard digit={formattedSeconds[1]} />
        </div>
      </div>
    </div>
  );
};

export default FlipClock;
