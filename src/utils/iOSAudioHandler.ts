
export class IOSAudioHandler {
  private lastPlayAttempt: number = 0;
  private soundBlockedUntil: number = 0;

  canPlaySound(): boolean {
    const now = Date.now();
    if (now < this.soundBlockedUntil) {
      console.log('iOS: Sound blocked due to recent reset');
      return false;
    }
    if (now - this.lastPlayAttempt < 1200) {
      console.log('iOS: Sound prevented - too many rapid button presses');
      return false;
    }
    return true;
  }

  updateLastPlayAttempt(): void {
    this.lastPlayAttempt = Date.now();
  }

  blockSounds(durationMs: number): void {
    this.soundBlockedUntil = Date.now() + durationMs;
    console.log(`Sounds blocked for ${durationMs}ms from AudioService level`);
  }
}
