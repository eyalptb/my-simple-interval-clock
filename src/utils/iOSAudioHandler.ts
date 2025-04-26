
export class IOSAudioHandler {
  private lastPlayAttempt: number = 0;
  private startSoundPlayed: boolean = false;
  
  private readonly RATE_LIMIT_DURATION = 8000;   // 8 seconds
  
  // Simplified method that only does basic rate limiting
  canPlayProgressSound(type: 'start' | 'end'): boolean {
    const now = Date.now();
    
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
  
  // Register reset press now just resets the start sound status
  registerResetPress(): void {
    // Reset the start sound status when reset is pressed
    this.resetStartSoundStatus();
    console.log('iOS: Reset pressed - start sound status reset');
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
