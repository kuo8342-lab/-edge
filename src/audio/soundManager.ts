/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

class SoundManager {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private glideOsc: OscillatorNode | null = null;
  private glideGain: GainNode | null = null;
  private glideFilter: BiquadFilterNode | null = null;
  private isInitialized: boolean = false;

  constructor() {
    // AudioContext will be initialized on first user gesture
  }

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    if (!this.isInitialized && this.ctx) {
      this.isInitialized = true;
      this.setupGlideSynth();
    }
  }

  private setupGlideSynth() {
    if (!this.ctx) return;
    try {
      this.glideOsc = this.ctx.createOscillator();
      this.glideGain = this.ctx.createGain();
      this.glideFilter = this.ctx.createBiquadFilter();

      this.glideOsc.type = 'triangle';
      this.glideOsc.frequency.setValueAtTime(60, this.ctx.currentTime);

      this.glideFilter.type = 'lowpass';
      this.glideFilter.frequency.setValueAtTime(220, this.ctx.currentTime);

      this.glideGain.gain.setValueAtTime(0, this.ctx.currentTime);

      this.glideOsc.connect(this.glideFilter);
      this.glideFilter.connect(this.glideGain);
      this.glideGain.connect(this.ctx.destination);

      this.glideOsc.start();
    } catch {
      // Audio might be restricted
    }
  }

  public setMute(muted: boolean) {
    this.isMuted = muted;
    if (this.isMuted && this.glideGain && this.ctx) {
      this.glideGain.gain.cancelScheduledValues(this.ctx.currentTime);
      this.glideGain.gain.setValueAtTime(0, this.ctx.currentTime);
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public toggleMute(): boolean {
    this.setMute(!this.isMuted);
    return this.isMuted;
  }

  public updateGlideSound(speedRatio: number, isAir: boolean, isBoosting: boolean) {
    if (this.isMuted || !this.ctx || !this.glideGain || !this.glideOsc || !this.glideFilter) return;
    const now = this.ctx.currentTime;
    if (isAir || speedRatio <= 0.05) {
      this.glideGain.gain.setTargetAtTime(0.001, now, 0.08);
    } else {
      const targetVol = (isBoosting ? 0.08 : 0.04) * Math.min(speedRatio, 1.2);
      const targetFreq = 50 + speedRatio * 80 + (isBoosting ? 40 : 0);
      const targetCutoff = 180 + speedRatio * 320;
      this.glideGain.gain.setTargetAtTime(targetVol, now, 0.05);
      this.glideOsc.frequency.setTargetAtTime(targetFreq, now, 0.05);
      this.glideFilter.frequency.setTargetAtTime(targetCutoff, now, 0.05);
    }
  }

  public playCollectStar() {
    this.initContext();
    if (this.isMuted || !this.ctx) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, now); // D5
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.12); // A5

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.25);
  }

  public playCollectBoost() {
    this.initContext();
    if (this.isMuted || !this.ctx) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(960, now + 0.18);

    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.22);
  }

  public playCollectHeart() {
    this.initContext();
    if (this.isMuted || !this.ctx) return;
    const now = this.ctx.currentTime;

    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const t = now + idx * 0.06;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.08, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.2);
    });
  }

  public playRampJump() {
    this.initContext();
    if (this.isMuted || !this.ctx) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(240, now);
    osc.frequency.exponentialRampToValueAtTime(720, now + 0.28);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.35);
  }

  public playTrickSpin() {
    this.initContext();
    if (this.isMuted || !this.ctx) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(1100, now + 0.2);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.25);
  }

  public playLanding() {
    this.initContext();
    if (this.isMuted || !this.ctx) return;
    const now = this.ctx.currentTime;

    // Low thump + splash noise
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(120, now);
    osc.frequency.exponentialRampToValueAtTime(30, now + 0.2);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.25);
  }

  public playBoostThrust() {
    this.initContext();
    if (this.isMuted || !this.ctx) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(450, now + 0.25);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.3);
  }

  public playCrash() {
    this.initContext();
    if (this.isMuted || !this.ctx) return;
    const now = this.ctx.currentTime;

    // Heavy crash impact
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(25, now + 0.35);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.4);
  }

  public playMonsterWarning() {
    this.initContext();
    if (this.isMuted || !this.ctx) return;
    const now = this.ctx.currentTime;

    // Siren alarm pulses
    for (let i = 0; i < 2; i++) {
      const t = now + i * 0.22;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(440, t);
      osc.frequency.linearRampToValueAtTime(740, t + 0.12);

      gain.gain.setValueAtTime(0.09, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.18);
    }
  }

  public playMonsterRoar(isKraken: boolean) {
    this.initContext();
    if (this.isMuted || !this.ctx) return;
    const now = this.ctx.currentTime;

    // Deep subterranean rumble and roar
    const osc = this.ctx.createOscillator();
    const mod = this.ctx.createOscillator();
    const modGain = this.ctx.createGain();
    const gain = this.ctx.createGain();

    osc.type = isKraken ? 'sawtooth' : 'triangle';
    osc.frequency.setValueAtTime(isKraken ? 75 : 90, now);
    osc.frequency.exponentialRampToValueAtTime(isKraken ? 40 : 55, now + 0.8);

    mod.frequency.setValueAtTime(isKraken ? 14 : 20, now);
    modGain.gain.setValueAtTime(45, now);

    mod.connect(modGain);
    modGain.connect(osc.frequency);

    gain.gain.setValueAtTime(0.28, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.9);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    mod.start(now);
    osc.start(now);
    mod.stop(now + 0.9);
    osc.stop(now + 0.9);
  }

  public playMonsterEscape() {
    this.initContext();
    if (this.isMuted || !this.ctx) return;
    const now = this.ctx.currentTime;

    // Victory fanfare notes
    const chords = [440, 554.37, 659.25, 880];
    chords.forEach((f, i) => {
      if (!this.ctx) return;
      const t = now + i * 0.08;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, t);
      gain.gain.setValueAtTime(0.12, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.3);
    });
  }
}

export const soundManager = new SoundManager();
