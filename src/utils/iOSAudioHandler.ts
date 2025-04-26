
export class IOSAudioHandler {
  // Track all interaction timestamps with longer cooldown periods
  private lastPlayAttempt: number = 0;
  private lastResetTime: number = 0;
  private soundsBlockedGlobally: boolean = false;
  private soundsBlockedUntil: number = 0;
  private startSoundPlayed: boolean = false;
  private soundInhibitAfterReset: boolean = true;
  private plusButtonPressCount: number = 0;
  private plusButtonResetTimestamp: number = 0;
  private consecutivePlusPresses: boolean = false;
  
  // Constants for timing
  private readonly RESET_BLOCK_DURATION = 30000; // 30 seconds
  private readonly RATE_LIMIT_DURATION = 8000;   // 8 seconds
  private readonly PLUS_BUTTON_MONITOR_WINDOW = 10000; // 10 seconds
  
  constructor() {
    // Reset plus button counter every 10 seconds
    setInterval(() => {
      if (Date.now() - this.plusButtonResetTimestamp > this.PLUS_BUTTON_MONITOR_WINDOW) {
        this.plusButtonPressCount = 0;
        this.consecutivePlusPresses = false;
      }
    }, this.PLUS_BUTTON_MONITOR_WINDOW);
  }

  // Main method to check if sound can play
  canPlaySound(type: 'start' | 'end'): boolean {
    const now = Date.now();
    
    // Global block check (most restrictive)
    if (this.soundsBlockedGlobally) {
      console.log(`iOS: Sound '${type}' blocked - Global block active`);
      return false;
    }
    
    // Time-based block check
    if (now < this.soundsBlockedUntil) {
      console.log(`iOS: Sound '${type}' blocked until ${new Date(this.soundsBlockedUntil).toLocaleTimeString()}`);
      return false;
    }
    
    // Rate limiting protection
    if (now - this.lastPlayAttempt < this.RATE_LIMIT_DURATION) {
      console.log(`iOS: Sound '${type}' prevented - rate limiting in effect (${this.RATE_LIMIT_DURATION}ms)`);
      return false;
    }
    
    // Start sound-specific checks
    if (type === 'start') {
      // After reset with consecutive plus buttons, block start sound
      if (this.consecutivePlusPresses && 
          now - this.lastResetTime < this.RESET_BLOCK_DURATION) {
        console.log('iOS: Start sound blocked due to consecutive plus buttons after reset');
        return false;
      }
      
      // Special handling to allow start sound to play only once per session
      // unless explicitly reset
      if (this.startSoundPlayed && this.soundInhibitAfterReset) {
        console.log('iOS: Start sound already played, inhibiting playback');
        return false;
      }
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
    this.soundsBlockedUntil = Date.now() + this.RESET_BLOCK_DURATION;
    this.soundInhibitAfterReset = true;
    this.plusButtonPressCount = 0;
    this.consecutivePlusPresses = false;
    console.log(`iOS: Reset pressed - sounds blocked for ${this.RESET_BLOCK_DURATION/1000}s`);
  }
  
  // Handle plus button presses
  registerPlusButtonPress(): void {
    const now = Date.now();
    
    // Update plus button monitoring
    this.plusButtonResetTimestamp = now;
    this.plusButtonPressCount++;
    
    // Set consecutive flag if we detect multiple presses
    if (this.plusButtonPressCount >= 2) {
      this.consecutivePlusPresses = true;
      console.log('iOS: Multiple plus buttons detected, blocking start sound');
      
      // Set global sound block for a short period
      this.blockAllSounds(5000);
    }
  }
  
  // Set start sound played status
  markStartSoundPlayed(): void {
    this.startSoundPlayed = true;
    console.log('iOS: Start sound marked as played');
  }
  
  // Reset start sound played status (when we specifically want to play it again)
  resetStartSoundStatus(): void {
    this.startSoundPlayed = false;
    this.soundInhibitAfterReset = false;
    console.log('iOS: Start sound status reset - will play on next attempt');
  }
  
  // Block all sounds for a duration
  blockAllSounds(durationMs: number = 15000): void {
    const now = Date.now();
    this.soundsBlockedUntil = Math.max(this.soundsBlockedUntil, now + durationMs);
    console.log(`iOS: All sounds blocked for ${durationMs/1000}s`);
  }
  
  // Complete global sound block (emergency)
  setGlobalSoundBlock(blocked: boolean): void {
    this.soundsBlockedGlobally = blocked;
    console.log(`iOS: Global sound block set to ${blocked}`);
  }
}
