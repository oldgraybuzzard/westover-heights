class NotificationSound {
  private static instance: NotificationSound;
  private audio: HTMLAudioElement | null = null;

  private constructor() {
    if (typeof window !== 'undefined') {
      this.audio = new Audio('/sounds/notification.mp3');
    }
  }

  public static getInstance(): NotificationSound {
    if (!NotificationSound.instance) {
      NotificationSound.instance = new NotificationSound();
    }
    return NotificationSound.instance;
  }

  public play() {
    if (this.audio) {
      this.audio.currentTime = 0;
      this.audio.play().catch(error => {
        console.error('Failed to play notification sound:', error);
      });
    }
  }

  public setVolume(volume: number) {
    if (this.audio) {
      this.audio.volume = Math.max(0, Math.min(1, volume));
    }
  }
}

export default NotificationSound.getInstance(); 