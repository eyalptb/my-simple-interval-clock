
import React, { useState, useEffect } from 'react';
import { useTimer } from '@/contexts/TimerContext';

interface FlipCardProps {
  digit: string;
}

const FlipCard: React.FC<FlipCardProps> = ({ digit }) => {
  const [flip, setFlip] = useState(false);
  const [currentDigit, setCurrentDigit] = useState(digit);
  const [nextDigit, setNextDigit] = useState(digit);
  const { theme } = useTimer();
  
  // Get theme colors based on selected theme
  const getThemeStyles = () => {
    switch (theme) {
      case 'black-white':
        return { bg: 'bg-clock-black-white-background', text: 'text-clock-black-white-text' };
      case 'white-black':
        return { bg: 'bg-clock-white-black-background', text: 'text-clock-white-black-text' };
      case 'neon-green':
        return { bg: 'bg-clock-neon-green-background', text: 'text-clock-neon-green-text' };
      case 'neon-red':
        return { bg: 'bg-clock-neon-red-background', text: 'text-clock-neon-red-text' };
      case 'neon-pink':
        return { bg: 'bg-clock-neon-pink-background', text: 'text-clock-neon-pink-text' };
      default:
        return { bg: 'bg-clock-black-white-background', text: 'text-clock-black-white-text' };
    }
  };
  
  const { bg, text } = getThemeStyles();

  useEffect(() => {
    if (digit !== currentDigit) {
      setNextDigit(digit);
      setFlip(true);
      
      const timer = setTimeout(() => {
        setCurrentDigit(digit);
        setFlip(false);
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [digit, currentDigit]);

  return (
    <div className={`flip-card ${flip ? 'flipped' : ''} w-full h-full`}>
      <div className="flip-card-inner">
        <div className={`flip-card-front ${bg} shadow-md flex items-center justify-center`}>
          <span className={`text-6xl font-bold ${text}`}>{currentDigit}</span>
        </div>
        <div className={`flip-card-back ${bg} shadow-md flex items-center justify-center`}>
          <span className={`text-6xl font-bold ${text}`}>{nextDigit}</span>
        </div>
      </div>
    </div>
  );
};

export default FlipCard;
