/**
 * Notification Sound Manager
 * Handles playing notification sounds with user preferences support
 */

export type NotificationSoundType = 'default' | 'success' | 'alert' | 'chime';

interface NotificationSoundOptions {
  volume?: number; // 0.0 to 1.0
  type?: NotificationSoundType;
}

class NotificationSoundManager {
  private audioContext: AudioContext | null = null;
  private soundEnabled: boolean = true;
  private volume: number = 0.5;
  private audioCache: Map<NotificationSoundType, AudioBuffer> = new Map();

  constructor() {
    // Initialize AudioContext on user interaction
    if (typeof window !== 'undefined') {
      this.initializeAudioContext();
    }
  }

  private initializeAudioContext() {
    // Create AudioContext lazily to avoid autoplay policy issues
    try {
      const AudioContextClass =
        window.AudioContext ||
        (window as any).webkitAudioContext ||
        (window as any).mozAudioContext;

      if (AudioContextClass) {
        this.audioContext = new AudioContextClass();
      }
    } catch (error) {
      console.warn('AudioContext not supported:', error);
    }

    // Resume AudioContext on user interaction (required by some browsers)
    const resumeAudioContext = () => {
      if (this.audioContext && this.audioContext.state === 'suspended') {
        this.audioContext.resume();
      }
      // Remove listeners after first interaction
      document.removeEventListener('click', resumeAudioContext);
      document.removeEventListener('keydown', resumeAudioContext);
    };

    document.addEventListener('click', resumeAudioContext);
    document.addEventListener('keydown', resumeAudioContext);
  }

  /**
   * Generate a notification sound using Web Audio API
   * This creates a pleasant notification beep without requiring audio files
   */
  private async generateNotificationSound(
    type: NotificationSoundType = 'default'
  ): Promise<AudioBuffer | null> {
    if (!this.audioContext) {
      return null;
    }

    // Check cache first
    if (this.audioCache.has(type)) {
      return this.audioCache.get(type)!;
    }

    try {
      const sampleRate = this.audioContext.sampleRate;
      const duration = type === 'alert' ? 0.4 : 0.3;
      const buffer = this.audioContext.createBuffer(
        1,
        sampleRate * duration,
        sampleRate
      );
      const data = buffer.getChannelData(0);

      // Generate different sounds based on type
      switch (type) {
        case 'default':
          // Two-tone notification (pleasant C5 -> E5)
          this.generateTwoTone(data, sampleRate, 523.25, 659.25, duration);
          break;

        case 'success':
          // Three ascending tones (C5 -> E5 -> G5)
          this.generateThreeTone(
            data,
            sampleRate,
            523.25,
            659.25,
            783.99,
            duration
          );
          break;

        case 'alert':
          // Urgent double beep (A5)
          this.generateDoubleTone(data, sampleRate, 880.0, duration);
          break;

        case 'chime':
          // Gentle single chime (E5)
          this.generateSingleTone(data, sampleRate, 659.25, duration);
          break;
      }

      // Cache the buffer
      this.audioCache.set(type, buffer);
      return buffer;
    } catch (error) {
      console.error('Error generating notification sound:', error);
      return null;
    }
  }

  /**
   * Generate a two-tone notification sound
   */
  private generateTwoTone(
    data: Float32Array,
    sampleRate: number,
    freq1: number,
    freq2: number,
    duration: number
  ) {
    const halfDuration = Math.floor((sampleRate * duration) / 2);

    for (let i = 0; i < data.length; i++) {
      const time = i / sampleRate;
      const frequency = i < halfDuration ? freq1 : freq2;

      // Generate sine wave with envelope
      const envelope = this.getEnvelope(i, data.length, duration);
      data[i] = Math.sin(2 * Math.PI * frequency * time) * envelope;
    }
  }

  /**
   * Generate a three-tone notification sound
   */
  private generateThreeTone(
    data: Float32Array,
    sampleRate: number,
    freq1: number,
    freq2: number,
    freq3: number,
    duration: number
  ) {
    const thirdDuration = Math.floor((sampleRate * duration) / 3);

    for (let i = 0; i < data.length; i++) {
      const time = i / sampleRate;
      let frequency = freq1;

      if (i >= thirdDuration * 2) {
        frequency = freq3;
      } else if (i >= thirdDuration) {
        frequency = freq2;
      }

      // Generate sine wave with envelope
      const envelope = this.getEnvelope(i, data.length, duration);
      data[i] = Math.sin(2 * Math.PI * frequency * time) * envelope;
    }
  }

  /**
   * Generate a double-tone alert sound
   */
  private generateDoubleTone(
    data: Float32Array,
    sampleRate: number,
    frequency: number,
    duration: number
  ) {
    const pulseDuration = Math.floor((sampleRate * duration) / 4);
    const gap = Math.floor(sampleRate * 0.05); // 50ms gap

    for (let i = 0; i < data.length; i++) {
      const time = i / sampleRate;

      // Create two pulses with a gap
      const inFirstPulse = i < pulseDuration;
      const inSecondPulse =
        i >= pulseDuration + gap && i < pulseDuration * 2 + gap;

      if (inFirstPulse || inSecondPulse) {
        const pulseTime = inFirstPulse ? i : i - (pulseDuration + gap);
        const envelope = this.getEnvelope(pulseTime, pulseDuration, 0.1);
        data[i] = Math.sin(2 * Math.PI * frequency * time) * envelope;
      } else {
        data[i] = 0;
      }
    }
  }

  /**
   * Generate a single-tone chime sound
   */
  private generateSingleTone(
    data: Float32Array,
    sampleRate: number,
    frequency: number,
    duration: number
  ) {
    for (let i = 0; i < data.length; i++) {
      const time = i / sampleRate;
      const envelope = this.getEnvelope(i, data.length, duration);
      data[i] = Math.sin(2 * Math.PI * frequency * time) * envelope;
    }
  }

  /**
   * Get envelope for smooth attack and decay
   */
  private getEnvelope(
    sampleIndex: number,
    totalSamples: number,
    duration: number
  ): number {
    const attackTime = 0.02; // 20ms attack
    const releaseTime = 0.1; // 100ms release
    const sustainLevel = 0.7;

    const attackSamples = attackTime * (totalSamples / duration);
    const releaseSamples = releaseTime * (totalSamples / duration);

    if (sampleIndex < attackSamples) {
      // Attack phase
      return (sampleIndex / attackSamples) * sustainLevel;
    } else if (sampleIndex > totalSamples - releaseSamples) {
      // Release phase
      return (
        ((totalSamples - sampleIndex) / releaseSamples) * sustainLevel
      );
    } else {
      // Sustain phase
      return sustainLevel;
    }
  }

  /**
   * Play notification sound
   */
  async play(options: NotificationSoundOptions = {}): Promise<void> {
    if (!this.soundEnabled) {
      return;
    }

    const type = options.type || 'default';
    const volume = options.volume !== undefined ? options.volume : this.volume;

    try {
      if (!this.audioContext) {
        this.initializeAudioContext();
      }

      if (!this.audioContext) {
        console.warn('AudioContext not available');
        return;
      }

      // Resume AudioContext if suspended
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      const buffer = await this.generateNotificationSound(type);
      if (!buffer) {
        return;
      }

      // Create source and gain nodes
      const source = this.audioContext.createBufferSource();
      const gainNode = this.audioContext.createGain();

      source.buffer = buffer;
      gainNode.gain.value = Math.max(0, Math.min(1, volume));

      // Connect nodes
      source.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      // Play sound
      source.start(0);
    } catch (error) {
      console.error('Error playing notification sound:', error);
    }
  }

  /**
   * Set notification sound enabled/disabled
   */
  setEnabled(enabled: boolean): void {
    this.soundEnabled = enabled;
  }

  /**
   * Get current enabled state
   */
  isEnabled(): boolean {
    return this.soundEnabled;
  }

  /**
   * Set volume (0.0 to 1.0)
   */
  setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
  }

  /**
   * Get current volume
   */
  getVolume(): number {
    return this.volume;
  }

  /**
   * Test notification sound
   */
  async test(type: NotificationSoundType = 'default'): Promise<void> {
    await this.play({ type, volume: this.volume });
  }

  /**
   * Clean up resources
   */
  dispose(): void {
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    this.audioCache.clear();
  }
}

// Singleton instance
let notificationSoundInstance: NotificationSoundManager | null = null;

export const getNotificationSoundManager = (): NotificationSoundManager => {
  if (!notificationSoundInstance) {
    notificationSoundInstance = new NotificationSoundManager();
  }
  return notificationSoundInstance;
};

export const disposeNotificationSoundManager = (): void => {
  if (notificationSoundInstance) {
    notificationSoundInstance.dispose();
    notificationSoundInstance = null;
  }
};
