
import { useState, useCallback } from 'react';
import { Howl } from 'howler';
import goMp3 from '@/assets/audio/go.mp3';
import whistleMp3 from '@/assets/audio/whistle.mp3';

const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

export const useIOSTimerAudio = (isMuted: boolean) => {
  const [goSound] = useState(new Howl({
    src: [goMp3],
    volume: isMuted ? 0 : 1,
    preload: true
  }));

  const [whistleSound] = useState(new Howl({
    src: [whistleMp3],
    volume: isMuted ? 0 : 1,
    preload: true
  }));

  const playStartSound = useCallback(() => {
    if (!isIOS || isMuted) return;
    
    try {
      goSound.play();
    } catch (error) {
      console.error('Error playing iOS start sound:', error);
    }
  }, [goSound, isMuted]);

  const playEndSound = useCallback(() => {
    if (!isIOS || isMuted) return;
    
    try {
      whistleSound.play();
    } catch (error) {
      console.error('Error playing iOS end sound:', error);
    }
  }, [whistleSound, isMuted]);

  return {
    playStartSound,
    playEndSound
  };
};
