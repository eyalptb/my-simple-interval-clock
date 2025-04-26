
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

  // Initialize the audio on component mount
  useEffect(() => {
    // For Safari and mobile browsers, unlock audio context with user interaction
    const unlockAudioContext = () => {
      console.log('Attempting to unlock audio context...');
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      if (audioContext.state === 'suspended') {
        audioContext.resume();
      }
      
      // Create a silent audio buffer and play it
      const buffer = audioContext.createBuffer(1, 1, 22050);
      const source = audioContext.createBufferSource();
      source.buffer = buffer;
      source.connect(audioContext.destination);
      source.start(0);
      
      document.removeEventListener('click', unlockAudioContext);
      document.removeEventListener('touchstart', unlockAudioContext);
    };
    
    document.addEventListener('click', unlockAudioContext);
    document.addEventListener('touchstart', unlockAudioContext);
    
    // Initialize the audio service
    const audioService = AudioService.getInstance();
    
    console.log('Initializing audio files from paths');
    
    // Create audio elements
    const startSound = audioService.createAudio('start');
    const endSound = audioService.createAudio('end');
    
    // Store the audio elements
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
        console.error('Error code:', (startSound as any).error?.code);
        console.error('Error message:', (startSound as any).error?.message);
      });
    }
    
    if (endSound) {
      endSound.addEventListener('canplaythrough', () => {
        console.log('End sound loaded successfully');
        setAudioLoaded(prev => ({ ...prev, end: true }));
      });
      
      endSound.addEventListener('error', (e) => {
        console.error('End sound failed to load:', e);
        console.error('Error code:', (endSound as any).error?.code);
        console.error('Error message:', (endSound as any).error?.message);
      });
    }

    // Cleanup function
    return () => {
      document.removeEventListener('click', unlockAudioContext);
      document.removeEventListener('touchstart', unlockAudioContext);
      
      if (audioStore.current.startSound) {
        audioStore.current.startSound.pause();
        audioStore.current.startSound = undefined;
      }
      if (audioStore.current.endSound) {
        audioStore.current.endSound.pause();
        audioStore.current.endSound = undefined;
      }
    };
  }, []);

  // Function to play a sound
  const playSound = async (type: 'start' | 'end') => {
    if (isMuted) {
      console.log('Audio is muted, not playing sound');
      return;
    }
    
    console.log(`Attempting to play ${type} sound...`);
    
    // Re-create the audio element each time to avoid issues with replaying
    const audioService = AudioService.getInstance();
    const sound = audioService.createAudio(type);
    
    if (sound) {
      try {
        console.log(`Playing ${type} sound...`);
        audioStore.current.attemptedToPlay = true;
        
        // Update the store with the new sound
        if (type === 'start') {
          audioStore.current.startSound = sound;
        } else {
          audioStore.current.endSound = sound;
        }
        
        const playPromise = sound.play();
        
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              console.log(`${type} sound played successfully`);
            })
            .catch(error => {
              console.error(`Error playing ${type} sound:`, error);
              
              // Only show the toast if we haven't already
              if (!audioStore.current.attemptedToPlay) {
                toast({
                  title: 'Audio Notice',
                  description: 'Please interact with the page to enable sound playback.',
                  variant: 'default'
                });
                audioStore.current.attemptedToPlay = true;
              }
            });
        }
      } catch (error) {
        console.error(`Error playing ${type} sound:`, error);
      }
    } else {
      console.error(`${type} sound is not available`);
    }
  };

  return {
    playStartSound: () => playSound('start'),
    playEndSound: () => playSound('end'),
    audioStore,
    audioLoaded,
  };
};
