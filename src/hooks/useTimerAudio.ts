
import { useEffect, useRef, useState } from 'react';
import { toast } from '@/hooks/use-toast';
import AudioService from '@/services/AudioService';

interface AudioStore {
  startSound: HTMLAudioElement | undefined;
  endSound: HTMLAudioElement | undefined;
  attemptedToPlay: boolean;
}

export const useTimerAudio = (isMuted: boolean) => {
  const audioStore = useRef<AudioStore>({
    startSound: undefined,
    endSound: undefined,
    attemptedToPlay: false
  });
  
  const [audioLoaded, setAudioLoaded] = useState({
    start: false,
    end: false
  });

  useEffect(() => {
    const audioService = AudioService.getInstance();
    
    console.log('Initializing audio files from paths:', {
      start: audioService['audioConfig'].startSoundPath,
      end: audioService['audioConfig'].endSoundPath
    });
    
    const startSound = audioService.createAudio('start');
    const endSound = audioService.createAudio('end');
    
    console.log('Audio elements created:', { 
      startSound: startSound ? 'created' : 'failed',
      endSound: endSound ? 'created' : 'failed'
    });
    
    audioStore.current = {
      startSound,
      endSound,
      attemptedToPlay: false
    };

    // Add event listeners to monitor audio loading status
    if (startSound) {
      startSound.addEventListener('canplaythrough', () => {
        console.log('Start sound loaded successfully');
        setAudioLoaded(prev => ({ ...prev, start: true }));
      });
      
      startSound.addEventListener('error', (e) => {
        console.error('Start sound failed to load:', e);
        // Try using the fallback beep sound
        audioStore.current.startSound = audioService.createBeep();
      });
    }
    
    if (endSound) {
      endSound.addEventListener('canplaythrough', () => {
        console.log('End sound loaded successfully');
        setAudioLoaded(prev => ({ ...prev, end: true }));
      });
      
      endSound.addEventListener('error', (e) => {
        console.error('End sound failed to load:', e);
        // Try using the fallback beep sound
        audioStore.current.endSound = audioService.createBeep();
      });
    }

    // Explicitly trigger load
    if (startSound) startSound.load();
    if (endSound) endSound.load();
    
    return () => {
      if (audioStore.current.startSound) {
        audioStore.current.startSound.pause();
        audioStore.current.startSound.removeAttribute('src');
      }
      if (audioStore.current.endSound) {
        audioStore.current.endSound.pause();
        audioStore.current.endSound.removeAttribute('src');
      }
    };
  }, []);

  const playSound = async (type: 'start' | 'end') => {
    if (isMuted) return;
    
    const sound = type === 'start' ? 
      audioStore.current.startSound : 
      audioStore.current.endSound;

    if (sound) {
      try {
        // Reset the playback position
        sound.currentTime = 0;
        audioStore.current.attemptedToPlay = true;
        console.log(`Playing ${type} sound...`);
        
        // Try to play the sound
        const playPromise = sound.play();
        
        // Modern browsers return a promise from the play function
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              console.log(`${type} sound played successfully`);
            })
            .catch(error => {
              console.error(`Error playing ${type} sound:`, error);
              
              // Fall back to the default beep sound
              const audioService = AudioService.getInstance();
              const beepSound = audioService.createBeep();
              
              if (beepSound) {
                beepSound.play().catch(e => {
                  console.error('Fallback beep also failed:', e);
                });
              }
              
              // Only show the toast on the first attempt
              if (!audioStore.current.attemptedToPlay) {
                toast({
                  title: 'Audio Notice',
                  description: 'Some browsers require user interaction before playing audio.',
                  variant: 'default'
                });
              }
            });
        }
      } catch (error) {
        console.error(`Error playing ${type} sound:`, error);
      }
    } else {
      console.error(`${type} sound is not available`);
      
      // Try to use the fallback beep
      const audioService = AudioService.getInstance();
      const beepSound = audioService.createBeep();
      
      if (beepSound) {
        beepSound.play().catch(e => {
          console.error('Fallback beep failed:', e);
        });
      }
    }
  };

  return {
    playStartSound: () => playSound('start'),
    playEndSound: () => playSound('end'),
    audioStore,
    audioLoaded,
  };
};
