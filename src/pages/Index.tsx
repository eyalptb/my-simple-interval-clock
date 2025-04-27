import React from 'react';
import { TimerProvider } from '@/contexts/TimerContext';
import FlipClock from '@/components/FlipClock';
import TimerControls from '@/components/TimerControls';
import ThemeSelector from '@/components/ThemeSelector';
import Advertisement from '@/components/Advertisement';
import WorkoutStatus from '@/components/WorkoutStatus';
import { Facebook, Twitter, Linkedin, Mail } from 'lucide-react';
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
              className="rounded-lg shadow-sm bg-card p-4"
            >
              <ThemeSelector />
            </section>
          </div>
          
          <footer className="mt-12 border-t border-border">
            <div className="container mx-auto px-4 py-8 max-w-4xl">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
                <div>
                  <h3 className="font-semibold mb-4">Contact</h3>
                  <div className="space-y-2">
                    <a href="mailto:contact@intervalclock.com" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                      <Mail size={16} />
                      contact@intervalclock.com
                    </a>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-4">Legal</h3>
                  <div className="space-y-2">
                    <Link to="/terms" className="block text-sm text-muted-foreground hover:text-foreground">Terms of Service</Link>
                    <Link to="/privacy" className="block text-sm text-muted-foreground hover:text-foreground">Privacy Policy</Link>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-4">Share</h3>
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
                </div>
              </div>
              
              <div className="text-center text-sm text-muted-foreground border-t border-border pt-8">
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
