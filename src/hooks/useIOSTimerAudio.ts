
import useSound from 'use-sound';
import goMp3 from '@/assets/audio/go.mp3';
import whistleMp3 from '@/assets/audio/whistle.mp3';

const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

export const useIOSTimerAudio = (isMuted: boolean) => {
  const [playGo] = useSound(goMp3, {
    volume: isMuted ? 0 : 1,
    soundEnabled: isIOS, // Only enable for iOS
  });

  const [playWhistle] = useSound(whistleMp3, {
    volume: isMuted ? 0 : 1,
    soundEnabled: isIOS, // Only enable for iOS
  });

  const playStartSound = async () => {
    if (!isIOS) return; // Only handle iOS devices
    if (isMuted) return;
    
    try {
      await playGo();
    } catch (error) {
      console.error('Error playing iOS start sound:', error);
    }
  };

  const playEndSound = async () => {
    if (!isIOS) return; // Only handle iOS devices
    if (isMuted) return;
    
    try {
      await playWhistle();
    } catch (error) {
      console.error('Error playing iOS end sound:', error);
    }
  };

  return {
    playStartSound,
    playEndSound
  };
};
