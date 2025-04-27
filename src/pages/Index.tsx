import React from 'react';
import { TimerProvider } from '@/contexts/TimerContext';
import FlipClock from '@/components/FlipClock';
import TimerControls from '@/components/TimerControls';
import ThemeSelector from '@/components/ThemeSelector';
import Advertisement from '@/components/Advertisement';
import WorkoutStatus from '@/components/WorkoutStatus';
import OptimizedImage from '@/components/OptimizedImage';
import { Facebook, Twitter, Linkedin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const Index = () => {
  return (
    <TimerProvider>
      <main className="min-h-screen flex flex-col bg-background">
        <div className="container mx-auto px-4 py-8 flex-1 max-w-md">
          <section 
            aria-label="Advertisement" 
            className="mb-8 rounded-lg shadow-sm bg-card"
          >
            <Advertisement />
          </section>
          
          <header className="mb-8 text-center">
            <h1 className="text-3xl font-bold tracking-tight">Interval Clock</h1>
            <h2 className="text-xl mt-2 text-muted-foreground">
              Enjoy using this free online interval timer made with love
            </h2>
          </header>
          
          <div className="space-y-8">
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
              className="bg-transparent"
            >
              <ThemeSelector />
            </section>
          </div>
          
          <footer className="mt-12 border-t border-border">
            <div className="container mx-auto px-4 py-6 flex flex-col items-center gap-6">
              <nav className="flex gap-4 text-sm text-muted-foreground">
                <a 
                  href="https://www.linkedin.com/in/eyal-wolanowski-8b50784a/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:text-foreground"
                >
                  Contact Me
                </a>
                <Link to="/terms" className="hover:text-foreground">Terms</Link>
                <Link to="/privacy" className="hover:text-foreground">Privacy Policy</Link>
              </nav>
              
              <div className="flex gap-4">
                <Button variant="ghost" size="icon" onClick={() => window.open('https://facebook.com/sharer/sharer.php?u=' + window.location.href)}>
                  <Facebook size={20} />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => window.open('https://twitter.com/intent/tweet?url=' + window.location.href)}>
                  <Twitter size={20} />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => window.open('https://www.linkedin.com/sharing/share-offsite/?url=' + window.location.href)}>
                  <Linkedin size={20} />
                </Button>
              </div>

              <div className="text-center text-sm text-muted-foreground">
                <p>©Eyal Wolanowski {new Date().getFullYear()}</p>
                <p className="mt-2 text-rose-600">Я люблю тебя, Аленушка моя ❤️</p>
              </div>
            </div>
          </footer>
        </div>
      </main>
    </TimerProvider>
  );
};

export default Index;
