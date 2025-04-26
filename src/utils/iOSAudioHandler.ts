
export class IOSAudioHandler {
  private lastPlayAttempt: number = 0;
  private soundBlockedUntil: number = 0;
  private iosSoundPlayed: { [key: string]: boolean } = { 'start': false, 'end': false };
  private resetBlockTime: number = 10000; // Increased to 10 seconds
  private rateBlockTime: number = 3000; // Increased to 3 seconds
  private forceBlockedState: boolean = false;

  canPlaySound(type: 'start' | 'end'): boolean {
    const now = Date.now();
    
    // Absolute block (emergency override)
    if (this.forceBlockedState) {
      console.log(`iOS: Sound '${type}' blocked - forced block active`);
      return false;
    }
    
    // Block sound if we're in reset cooldown period
    if (now < this.soundBlockedUntil) {
      console.log(`iOS: Sound '${type}' blocked due to recent reset or UI interaction until ${new Date(this.soundBlockedUntil).toLocaleTimeString()}`);
      return false;
    }
    
    // Rate limiting protection
    if (now - this.lastPlayAttempt < this.rateBlockTime) {
      console.log(`iOS: Sound '${type}' prevented - rate limiting in effect (${this.rateBlockTime}ms)`);
      return false;
    }
    
    // For start sound specifically, check if it was already played once
    if (type === 'start' && this.iosSoundPlayed['start']) {
      console.log('iOS: Start sound already played once this session');
      return false;
    }
    
    return true;
  }

  updateLastPlayAttempt(): void {
    this.lastPlayAttempt = Date.now();
  }

  blockSounds(durationMs: number = 10000): void {
    const now = Date.now();
    // Always use the longer duration between current block and new request
    this.soundBlockedUntil = Math.max(this.soundBlockedUntil, now + durationMs);
    console.log(`Sounds blocked until ${new Date(this.soundBlockedUntil).toLocaleTimeString()}`);
  }

  // Force block all sounds (emergency override)
  forceBlockSounds(blocked: boolean): void {
    this.forceBlockedState = blocked;
    if (blocked) {
      console.log('EMERGENCY: All iOS sounds forcefully blocked');
    } else {
      console.log('EMERGENCY: iOS sound force block released');
    }
  }

  // Track specific sound types that have been played
  setIOSSoundPlayed(type: 'start' | 'end', value: boolean): void {
    this.iosSoundPlayed[type] = value;
    console.log(`iOS ${type} sound played state set to ${value}`);
  }

  hasIOSSoundPlayed(type: 'start' | 'end'): boolean {
    return this.iosSoundPlayed[type] === true;
  }

  // Reset played state for specific sound type
  resetIOSSoundPlayed(type?: 'start' | 'end'): void {
    if (type) {
      this.iosSoundPlayed[type] = false;
      console.log(`iOS ${type} sound played state reset`);
    } else {
      // Reset all sound types if no specific type provided
      this.iosSoundPlayed = { 'start': false, 'end': false };
      console.log('All iOS sound played states reset');
    }
  }
}
