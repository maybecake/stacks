/**
 * Procedural sound effects via Web Audio API.
 * No audio files needed — all sounds are synthesised at runtime.
 *
 * AudioContext is created lazily on the first call so it falls within a
 * user-gesture (browsers block AudioContext creation before interaction).
 */

let _ctx: AudioContext | null = null;

function ctx(): AudioContext {
  if (!_ctx) _ctx = new AudioContext();
  // Resume in case the browser suspended it (common on mobile)
  if (_ctx.state === 'suspended') void _ctx.resume();
  return _ctx;
}

function gain(c: AudioContext, value: number): GainNode {
  const g = c.createGain();
  g.gain.value = value;
  return g;
}

function osc(
  c: AudioContext,
  type: OscillatorType,
  freqStart: number,
  freqEnd: number,
  duration: number,
  volume: number,
): void {
  const o = c.createOscillator();
  const g = gain(c, 0);
  o.type = type;
  o.frequency.setValueAtTime(freqStart, c.currentTime);
  if (freqEnd !== freqStart) {
    o.frequency.exponentialRampToValueAtTime(freqEnd, c.currentTime + duration);
  }
  g.gain.setValueAtTime(volume, c.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration);
  o.connect(g);
  g.connect(c.destination);
  o.start();
  o.stop(c.currentTime + duration);
}

function noteAfter(c: AudioContext, freq: number, delay: number, duration: number, volume: number): void {
  const o = c.createOscillator();
  const g = gain(c, 0);
  o.type = 'sine';
  o.frequency.value = freq;
  g.gain.setValueAtTime(0.001, c.currentTime + delay);
  g.gain.linearRampToValueAtTime(volume, c.currentTime + delay + 0.02);
  g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + delay + duration);
  o.connect(g);
  g.connect(c.destination);
  o.start(c.currentTime + delay);
  o.stop(c.currentTime + delay + duration + 0.05);
}

function noise(c: AudioContext, cutoff: number, volume: number, duration: number): void {
  const bufSize = Math.ceil(c.sampleRate * duration);
  const buf = c.createBuffer(1, bufSize, c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;

  const src = c.createBufferSource();
  src.buffer = buf;

  const filter = c.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = cutoff;

  const g = gain(c, volume);
  g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration);

  src.connect(filter);
  filter.connect(g);
  g.connect(c.destination);
  src.start();
  src.stop(c.currentTime + duration);
}

export const Sounds = {
  /** Short upward chirp when the player leaves the ground */
  jump(): void {
    const c = ctx();
    osc(c, 'sine', 220, 440, 0.12, 0.25);
  },

  /** Ascending three-note twinkle */
  collectHat(): void {
    const c = ctx();
    noteAfter(c, 523,  0,     0.12, 0.3);
    noteAfter(c, 784,  0.09,  0.12, 0.3);
    noteAfter(c, 1047, 0.18,  0.18, 0.25);
  },

  /** Metallic ping */
  pickUpKey(): void {
    const c = ctx();
    osc(c, 'triangle', 900, 450, 0.22, 0.2);
    osc(c, 'sine',     1200, 600, 0.15, 0.1);
  },

  /** Low wooden thud as a door swings open */
  openDoor(): void {
    const c = ctx();
    osc(c, 'sawtooth', 130, 60, 0.35, 0.18);
    noise(c, 400, 0.1, 0.3);
  },

  /** Descending "oops" tone on death / reset */
  die(): void {
    const c = ctx();
    osc(c, 'sine', 440, 110, 0.45, 0.35);
    osc(c, 'square', 220, 80, 0.4, 0.08);
  },

  /** Percussive boom when a cannon fires */
  cannonFire(): void {
    const c = ctx();
    noise(c, 180, 0.55, 0.18);
    osc(c, 'sine', 90, 40, 0.22, 0.4);
  },

  /** Hit by a cannonball — sharp crack */
  cannonballHit(): void {
    const c = ctx();
    noise(c, 600, 0.7, 0.12);
    osc(c, 'square', 300, 80, 0.2, 0.3);
  },

  /** Four-note rising fanfare on level complete */
  levelComplete(): void {
    const c = ctx();
    noteAfter(c, 523,  0,    0.15, 0.35);
    noteAfter(c, 659,  0.14, 0.15, 0.35);
    noteAfter(c, 784,  0.28, 0.15, 0.35);
    noteAfter(c, 1047, 0.42, 0.35, 0.35);
  },
};
