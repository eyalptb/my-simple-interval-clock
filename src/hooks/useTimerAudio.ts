
import { useEffect, useRef } from 'react';
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
      });
      
      startSound.addEventListener('error', (e) => {
        console.error('Start sound failed to load:', e);
      });
    }
    
    if (endSound) {
      endSound.addEventListener('canplaythrough', () => {
        console.log('End sound loaded successfully');
      });
      
      endSound.addEventListener('error', (e) => {
        console.error('End sound failed to load:', e);
      });
    }

    return () => {
      if (audioStore.current.startSound) audioStore.current.startSound.pause();
      if (audioStore.current.endSound) audioStore.current.endSound.pause();
    };
  }, []);

  const playSound = async (type: 'start' | 'end') => {
    if (isMuted) return;
    
    const sound = type === 'start' ? 
      audioStore.current.startSound : 
      audioStore.current.endSound;

    if (sound) {
      try {
        sound.currentTime = 0;
        audioStore.current.attemptedToPlay = true;
        console.log(`Playing ${type} sound...`);
        await sound.play();
        console.log(`${type} sound played successfully`);
      } catch (error) {
        console.error(`Error playing ${type} sound:`, error);
        toast({
          title: 'Audio Error',
          description: `Unable to play ${type} sound. Please check your audio settings.`,
          variant: 'destructive'
        });
      }
    } else {
      console.error(`${type} sound is not available`);
    }
  };

  return {
    playStartSound: () => playSound('start'),
    playEndSound: () => playSound('end'),
    audioStore,
  };
};
