
import React from 'react';
import { TimerProvider } from '@/contexts/TimerContext';
import FlipClock from '@/components/FlipClock';
import TimerControls from '@/components/TimerControls';
import ThemeSelector from '@/components/ThemeSelector';
import Advertisement from '@/components/Advertisement';

const Index = () => {
  return (
    <TimerProvider>
      <main className="min-h-screen flex flex-col">
        <div className="container mx-auto px-4 py-6 flex-1 max-w-md">
          <header className="mb-6">
            <h1 className="text-2xl font-bold text-center">Interval Clock</h1>
          </header>
          
          <section aria-label="Advertisement" className="mb-6">
            <Advertisement />
          </section>
          
          <section aria-label="Timer" className="mb-8">
            <FlipClock />
          </section>
          
          <section aria-label="Timer Controls" className="mb-8">
            <TimerControls />
          </section>
          
          <section aria-label="Theme Selection" className="mb-6">
            <ThemeSelector />
          </section>
          
          <footer className="text-center text-xs text-gray-500 mt-auto">
            <p>©{new Date().getFullYear()} Eyal Wolanowski</p>
          </footer>
        </div>
      </main>
    </TimerProvider>
  );
};

export default Index;
