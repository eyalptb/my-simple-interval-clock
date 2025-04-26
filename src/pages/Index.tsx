
import React, { useEffect } from 'react';
import { TimerProvider } from '@/contexts/TimerContext';
import FlipClock from '@/components/FlipClock';
import TimerControls from '@/components/TimerControls';
import ThemeSelector from '@/components/ThemeSelector';
import Advertisement from '@/components/Advertisement';
import WorkoutStatus from '@/components/WorkoutStatus';
import AudioService from '@/services/AudioService';

const Index = () => {
  // Initialize audio service on page load
  useEffect(() => {
    const audioService = AudioService.getInstance();
    
    // Create a handler for user interaction to initialize audio
    const handleInteraction = () => {
      audioService.initializeAudioContext().then(() => {
        audioService.initializeSounds();
        
        // Remove the event listeners after successful initialization
        ['click', 'touchstart', 'keydown'].forEach(event => {
          document.removeEventListener(event, handleInteraction);
        });
      });
    };
    
    // Add event listeners for user interaction
    ['click', 'touchstart', 'keydown'].forEach(event => {
      document.addEventListener(event, handleInteraction, { once: true });
    });
    
    // Also try to initialize immediately (may work if permissions already granted)
    audioService.initializeAudioContext().then(() => {
      audioService.initializeSounds();
    });
    
    // Cleanup
    return () => {
      ['click', 'touchstart', 'keydown'].forEach(event => {
        document.removeEventListener(event, handleInteraction);
      });
    };
  }, []);
  
  return (
    <TimerProvider>
      <main className="min-h-screen flex flex-col bg-background">
        <div className="container mx-auto px-4 py-8 flex-1 max-w-md">
          <header className="mb-8 text-center">
            <h1 className="text-3xl font-bold tracking-tight">Interval Clock</h1>
          </header>
          
          <div className="space-y-8">
            <section 
              aria-label="Advertisement" 
              className="rounded-lg shadow-sm bg-card"
            >
              <Advertisement />
            </section>
            
            <section 
              aria-label="Workout Status"
              className="bg-transparent"
            >
              <WorkoutStatus />
            </section>
            
            <section 
              aria-label="Timer Display" 
              className="rounded-lg shadow-md bg-card p-4"
            >
              <FlipClock />
            </section>
            
            <section 
              aria-label="Timer Controls" 
              className="bg-transparent"
            >
              <TimerControls />
            </section>
            
            <section 
              aria-label="Theme Selection" 
              className="rounded-lg shadow-sm bg-card p-4"
            >
              <ThemeSelector />
            </section>
          </div>
          
          <footer className="mt-12 text-center text-sm text-muted-foreground">
            <p>©Eyal Wolanowski {new Date().getFullYear()}</p>
            <p className="mt-2 text-rose-600">Я люблю тебя, Аленушка моя ❤️</p>
          </footer>
        </div>
      </main>
    </TimerProvider>
  );
};

export default Index;
