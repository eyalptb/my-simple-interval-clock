
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

  // Function to play a short beep sound using Web Audio API
  const playFallbackBeep = (duration = 300, frequency = 800, volume = 0.5) => {
    try {
      // Create an audio context
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Create oscillator and gain nodes
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      // Connect the nodes
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Configure the sound
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(volume, audioContext.currentTime + 0.01);
      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';
      
      // Start the oscillator
      oscillator.start();
      
      // Fade out and stop
      gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + duration/1000);
      
      // Schedule stop
      setTimeout(() => {
        oscillator.stop();
        audioContext.close();
      }, duration);
      
      return true;
    } catch (error) {
      console.error('Failed to play fallback beep:', error);
      return false;
    }
  };

  // Initialize the audio on component mount
  useEffect(() => {
    // For Safari, try to unlock audio context with a silent audio element
    const unlockAudio = () => {
      const silentAudio = new Audio("data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA/+M4wAAAAAAAAAAAAEluZm8AAAAPAAAAAwAAAbAAX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19f/+MYxAAUAFL8AAAAAX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19f/+MYxA8Ri8qEAFnGAX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19");
      silentAudio.play().catch(() => {});
    };
    
    // Try to unlock audio on page load and user interaction
    unlockAudio();
    document.addEventListener('click', unlockAudio);
    document.addEventListener('touchstart', unlockAudio);
    
    // Initialize the audio service
    const audioService = AudioService.getInstance();
    
    console.log('Initializing audio files for timer sounds');
    
    // Create audio elements
    const startSound = audioService.createAudio('start');
    const endSound = audioService.createAudio('end');
    
    console.log('Audio elements created:', { 
      startSound: startSound ? 'created' : 'failed',
      endSound: endSound ? 'created' : 'failed'
    });
    
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
      });
    }
    
    if (endSound) {
      endSound.addEventListener('canplaythrough', () => {
        console.log('End sound loaded successfully');
        setAudioLoaded(prev => ({ ...prev, end: true }));
      });
      
      endSound.addEventListener('error', (e) => {
        console.error('End sound failed to load:', e);
      });
    }

    // Pre-test audio playback to try to resolve autoplay restrictions
    // This often works in browsers that have autoplay policies
    const testSound = startSound || audioService.createBeep();
    if (testSound) {
      testSound.volume = 0.01; // Nearly silent
      testSound.play().then(() => {
        console.log('Audio pre-test successful, audio should work');
        testSound.pause();
        testSound.currentTime = 0;
      }).catch(e => {
        console.log('Audio pre-test failed, browser may block autoplay:', e);
      });
    }

    // Cleanup function
    return () => {
      document.removeEventListener('click', unlockAudio);
      document.removeEventListener('touchstart', unlockAudio);
      
      if (audioStore.current.startSound) {
        audioStore.current.startSound.pause();
        audioStore.current.startSound.src = '';
      }
      if (audioStore.current.endSound) {
        audioStore.current.endSound.pause();
        audioStore.current.endSound.src = '';
      }
    };
  }, []);

  // Function to play a sound
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
        
        // Play the sound, handle autoplay restrictions with fallbacks
        const playPromise = sound.play();
        
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              console.log(`${type} sound played successfully`);
            })
            .catch(error => {
              console.error(`Error playing ${type} sound:`, error);
              
              // Try the Web Audio API fallback beep sound
              const frequency = type === 'start' ? 800 : 1200;
              if (!playFallbackBeep(300, frequency, 0.5)) {
                // Final fallback - show toast if nothing works
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
        // Try Web Audio API fallback
        const frequency = type === 'start' ? 800 : 1200;
        playFallbackBeep(300, frequency, 0.5);
      }
    } else {
      console.error(`${type} sound is not available`);
      
      // Fallback to direct Web Audio API beep
      const frequency = type === 'start' ? 800 : 1200;
      playFallbackBeep(300, frequency, 0.5);
    }
  };

  return {
    playStartSound: () => playSound('start'),
    playEndSound: () => playSound('end'),
    audioStore,
    audioLoaded,
  };
};
