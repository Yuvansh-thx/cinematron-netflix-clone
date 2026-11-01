// Soothing & Tranquil Audio Engine for Cinematron
// Replaces harsh transients and noisy UI sound effects with meditative, peaceful acoustic resonance.
// Defaults to 100% silent browsing; all click and pop sound effects are disabled.

class SoundEngine {
  constructor() {
    this.ctx = null;
    // Default to Silent / Muted mode so browsing is quiet, serene, and peaceful by default.
    // If the user explicitly enables tranquil audio, persist their choice.
    const stored = localStorage.getItem('cinematron_sound_muted');
    this.isMuted = stored === null ? true : stored === 'true';
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Deeply soothing, peaceful Tibetan singing bowl resonance (432Hz calming Pythagorean tuning)
  // Replaces the jarring sub-bass Ta-Dum with a calming, meditative resonance
  playTaDum() {
    if (this.isMuted) return;
    try {
      this.init();
      if (!this.ctx) return;

      const t0 = this.ctx.currentTime;
      const masterGain = this.ctx.createGain();
      masterGain.connect(this.ctx.destination);
      masterGain.gain.setValueAtTime(0.09, t0); // Soft, comfortable ambient listening volume

      // Soft lowpass filter to remove any harshness or sharp clicks
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(360, t0);
      filter.frequency.exponentialRampToValueAtTime(540, t0 + 0.8);
      filter.frequency.exponentialRampToValueAtTime(240, t0 + 3.2);
      filter.connect(masterGain);

      // Warm calming harmonics:
      // 108Hz (Deep warm foundation), 216Hz (Warm octave), 432Hz (Peaceful fundamental), 648Hz (Subtle fifth)
      const harmonics = [
        { freq: 108.0, gain: 0.12, attack: 0.35, decay: 3.2 },
        { freq: 216.0, gain: 0.10, attack: 0.25, decay: 3.0 },
        { freq: 432.0, gain: 0.05, attack: 0.20, decay: 2.6 },
        { freq: 648.0, gain: 0.02, attack: 0.30, decay: 2.0 }
      ];

      harmonics.forEach(({ freq, gain, attack, decay }) => {
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = 'sine'; // Pure tranquil sine wave
        osc.frequency.setValueAtTime(freq, t0);

        // Serene crescendo and lingering peaceful decay
        g.gain.setValueAtTime(0.0001, t0);
        g.gain.linearRampToValueAtTime(gain, t0 + attack);
        g.gain.exponentialRampToValueAtTime(0.0001, t0 + decay);

        osc.connect(g);
        g.connect(filter);

        osc.start(t0);
        osc.stop(t0 + decay + 0.1);
      });
    } catch (e) {
      // Graceful fallback
    }
  }

  // Click & Pop sound effects REMOVED: Silent no-op for peaceful browsing
  playPop() {
    // Intentionally silent no-op to remove all noisy button clicks, pops, and ticks.
  }

  // Tranquil harmonic wind chime / singing bell for list additions (528Hz Solfeggio peaceful tone)
  playChime() {
    if (this.isMuted) return;
    try {
      this.init();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;

      // Dual harmonic pure sine chime
      const osc1 = this.ctx.createOscillator();
      const gain1 = this.ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(528, t); // 528Hz serenity solfeggio
      gain1.gain.setValueAtTime(0.0001, t);
      gain1.gain.linearRampToValueAtTime(0.035, t + 0.06);
      gain1.gain.exponentialRampToValueAtTime(0.0001, t + 1.2);

      const osc2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(792, t + 0.04); // 5th harmonic overtone
      gain2.gain.setValueAtTime(0.0001, t + 0.04);
      gain2.gain.linearRampToValueAtTime(0.02, t + 0.09);
      gain2.gain.exponentialRampToValueAtTime(0.0001, t + 1.4);

      osc1.connect(gain1);
      osc2.connect(gain2);
      gain1.connect(this.ctx.destination);
      gain2.connect(this.ctx.destination);

      osc1.start(t);
      osc2.start(t + 0.04);
      osc1.stop(t + 1.3);
      osc2.stop(t + 1.5);
    } catch (e) {
      // Ignore
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    localStorage.setItem('cinematron_sound_muted', this.isMuted ? 'true' : 'false');
    window.dispatchEvent(new CustomEvent('cinematron:sound-toggled', { detail: { isMuted: this.isMuted } }));
    return this.isMuted;
  }
}

export const sound = new SoundEngine();
