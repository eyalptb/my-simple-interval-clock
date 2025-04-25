
import React from 'react';
import { TimerProvider } from '@/contexts/TimerContext';
import FlipClock from '@/components/FlipClock';
import TimerControls from '@/components/TimerControls';
import ThemeSelector from '@/components/ThemeSelector';
import Advertisement from '@/components/Advertisement';

const Index = () => {
  return (
    <TimerProvider>
      <div className="min-h-screen flex flex-col">
        <div className="container mx-auto px-4 py-6 flex-1 max-w-md">
          <h1 className="text-2xl font-bold text-center mb-6">Interval Clock</h1>
          
          {/* Ad space */}
          <div className="mb-6">
            <Advertisement />
          </div>
          
          {/* Clock */}
          <div className="mb-8">
            <FlipClock />
          </div>
          
          {/* Controls */}
          <div className="mb-8">
            <TimerControls />
          </div>
          
          {/* Theme Selector */}
          <div className="mb-6">
            <ThemeSelector />
          </div>
          
          <div className="text-center text-xs text-gray-500 mt-auto">
            <p>©Eyal Wolanowski {new Date().getFullYear()}</p>
          </div>
        </div>
      </div>
    </TimerProvider>
  );
};

export default Index;
