
export class IOSAudioHandler {
  // Track only essential timestamps
  private lastPlayAttempt: number = 0;
  private lastResetTime: number = 0;
  private shouldBlockSounds: boolean = false;
  private startSoundPlayed: boolean = false;
  
  // Constants for timing
  private readonly RESET_BLOCK_DURATION = 30000; // 30 seconds
  private readonly RATE_LIMIT_DURATION = 8000;   // 8 seconds
  
  // Main method to check if sound can play
  canPlaySound(type: 'start' | 'end'): boolean {
    const now = Date.now();
    
    // Global block check
    if (this.shouldBlockSounds) {
      console.log(`iOS: Sound '${type}' blocked - Global block active`);
      return false;
    }
    
    // After reset, block for duration
    if (now - this.lastResetTime < this.RESET_BLOCK_DURATION) {
      console.log(`iOS: Sound '${type}' blocked - Reset cooldown active`);
      return false;
    }
    
    // Rate limiting protection
    if (now - this.lastPlayAttempt < this.RATE_LIMIT_DURATION) {
      console.log(`iOS: Sound '${type}' prevented - rate limiting in effect (${this.RATE_LIMIT_DURATION}ms)`);
      return false;
    }
    
    // Only allow start sound to play once per session unless reset
    if (type === 'start' && this.startSoundPlayed) {
      console.log('iOS: Start sound already played, inhibiting playback');
      return false;
    }
    
    return true;
  }

  // Record a play attempt
  updateLastPlayAttempt(): void {
    this.lastPlayAttempt = Date.now();
  }
  
  // Handle reset button presses
  registerResetPress(): void {
    this.lastResetTime = Date.now();
    this.shouldBlockSounds = true;
    
    // Auto-disable block after duration
    setTimeout(() => {
      this.shouldBlockSounds = false;
      console.log('iOS: Sound block removed after reset timeout');
    }, this.RESET_BLOCK_DURATION);
    
    console.log(`iOS: Reset pressed - sounds blocked for ${this.RESET_BLOCK_DURATION/1000}s`);
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
