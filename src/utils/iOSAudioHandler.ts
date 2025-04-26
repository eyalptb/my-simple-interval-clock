
export class IOSAudioHandler {
  private lastPlayAttempt: number = 0;
  private soundBlockedUntil: number = 0;
  private iosSoundPlayed: boolean = false;
  private resetBlockTime: number = 5000; // Increased to 5 seconds
  private rateBlockTime: number = 2000; // Increased to 2 seconds

  canPlaySound(): boolean {
    const now = Date.now();
    
    // Block sound if we're in reset cooldown period
    if (now < this.soundBlockedUntil) {
      console.log('iOS: Sound blocked due to recent reset or UI interaction');
      return false;
    }
    
    // Rate limiting protection
    if (now - this.lastPlayAttempt < this.rateBlockTime) {
      console.log('iOS: Sound prevented - rate limiting in effect');
      return false;
    }
    
    return true;
  }

  updateLastPlayAttempt(): void {
    this.lastPlayAttempt = Date.now();
  }

  blockSounds(durationMs: number = 5000): void {
    const now = Date.now();
    // Always use the longer duration between current block and new request
    this.soundBlockedUntil = Math.max(this.soundBlockedUntil, now + durationMs);
    console.log(`Sounds blocked until ${new Date(this.soundBlockedUntil).toLocaleTimeString()}`);
  }

  // Track if the iOS start sound has been played once already
  setIOSSoundPlayed(value: boolean): void {
    this.iosSoundPlayed = value;
  }

  hasIOSSoundPlayed(): boolean {
    return this.iosSoundPlayed;
  }

  // Special method to reset played state when timer is stopped
  resetIOSSoundPlayed(): void {
    this.iosSoundPlayed = false;
    console.log('iOS sound played state reset');
  }
}
