
export class IOSAudioHandler {
  private lastPlayAttempt: number = 0;
  private lastResetTime: number = 0;
  private shouldBlockProgressSounds: boolean = false;
  private startSoundPlayed: boolean = false;
  
  private readonly RESET_BLOCK_DURATION = 30000; // 30 seconds
  private readonly RATE_LIMIT_DURATION = 8000;   // 8 seconds
  
  // Refined method to check if progress sounds can play
  canPlayProgressSound(type: 'start' | 'end'): boolean {
    const now = Date.now();
    
    // Block progress sounds after reset for specific duration
    if (this.shouldBlockProgressSounds) {
      if (now - this.lastResetTime < this.RESET_BLOCK_DURATION) {
        console.log(`iOS: Progress sound '${type}' blocked - Reset cooldown active`);
        return false;
      } else {
        // Reset block automatically after duration
        this.shouldBlockProgressSounds = false;
      }
    }
    
    // Rate limiting for progress sounds
    if (now - this.lastPlayAttempt < this.RATE_LIMIT_DURATION) {
      console.log(`iOS: Progress sound '${type}' prevented - rate limiting in effect`);
      return false;
    }
    
    // Only allow start sound to play once per session unless reset
    if (type === 'start' && this.startSoundPlayed) {
      console.log('iOS: Start sound already played, inhibiting playback');
      return false;
    }
    
    return true;
  }

  // Update last play attempt for progress sounds
  updateLastProgressSoundAttempt(): void {
    this.lastPlayAttempt = Date.now();
  }
  
  // Handle reset button presses, specifically for progress sounds
  registerResetPress(): void {
    this.lastResetTime = Date.now();
    this.shouldBlockProgressSounds = true;
    
    console.log(`iOS: Reset pressed - progress sounds blocked for ${this.RESET_BLOCK_DURATION/1000}s`);
  }
  
  // Set start sound played status
  markStartSoundPlayed(): void {
    this.startSoundPlayed = true;
    console.log('iOS: Start sound marked as played');
  }
  
  // Reset start sound played status
  resetStartSoundStatus(): void {
    this.startSoundPlayed = false;
    console.log('iOS: Start sound status reset - will play on next attempt');
  }
}
