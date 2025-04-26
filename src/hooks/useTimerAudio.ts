
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

  // Function to play a short beep sound using Web Audio API as fallback
  const playFallbackBeep = (duration = 300, frequency = 800, volume = 0.5) => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(volume, audioContext.currentTime + 0.01);
      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';
      
      oscillator.start();
      gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + duration/1000);
      
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
    
    unlockAudio();
    document.addEventListener('click', unlockAudio);
    document.addEventListener('touchstart', unlockAudio);
    
    // Initialize the audio service
    const audioService = AudioService.getInstance();
    
    console.log('Initializing audio files: go.mp3 and whistle.mp3');
    
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
        console.log('Go sound loaded successfully');
        setAudioLoaded(prev => ({ ...prev, start: true }));
      });
      
      startSound.addEventListener('error', (e) => {
        console.error('Go sound failed to load:', e);
      });
    }
    
    if (endSound) {
      endSound.addEventListener('canplaythrough', () => {
        console.log('Whistle sound loaded successfully');
        setAudioLoaded(prev => ({ ...prev, end: true }));
      });
      
      endSound.addEventListener('error', (e) => {
        console.error('Whistle sound failed to load:', e);
      });
    }

    // Pre-test audio playback to try to resolve autoplay restrictions
    const testSound = startSound || audioService.createBeep();
    if (testSound) {
      testSound.volume = 0.01; // Nearly silent
      testSound.play().then(() => {
        console.log('Audio pre-test successful');
        testSound.pause();
        testSound.currentTime = 0;
      }).catch(e => {
        console.log('Audio pre-test failed, browser may block autoplay');
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
        console.log(`Playing ${type === 'start' ? 'go.mp3' : 'whistle.mp3'} sound...`);
        sound.currentTime = 0;
        audioStore.current.attemptedToPlay = true;
        
        const playPromise = sound.play();
        
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              console.log(`${type === 'start' ? 'Go' : 'Whistle'} sound played successfully`);
            })
            .catch(error => {
              console.error(`Error playing ${type} sound:`, error);
              
              // Try the Web Audio API fallback beep sound
              const frequency = type === 'start' ? 800 : 1200;
              if (!playFallbackBeep(300, frequency, 0.5)) {
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
        const frequency = type === 'start' ? 800 : 1200;
        playFallbackBeep(300, frequency, 0.5);
      }
    } else {
      console.error(`${type} sound is not available`);
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
