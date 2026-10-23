// DSP building blocks for the kit's generated music and sound effects: oscillators, envelopes,
// filters, a small reverb and a limiter (levels.mts measures and writes the result). Plain Float32Array maths, no dependencies,
// so every sound the kit ships is original and free of third-party licences.
export const SAMPLE_RATE = 44100;

export type Stereo = { readonly left: Float32Array; readonly right: Float32Array };

export const createStereo = (seconds: number): Stereo => {
  const length = Math.ceil(seconds * SAMPLE_RATE);
  return { left: new Float32Array(length), right: new Float32Array(length) };
};

export const seconds = (samples: number): number => samples / SAMPLE_RATE;
export const samplesOf = (time: number): number => Math.round(time * SAMPLE_RATE);
export const midiToHz = (midi: number): number => 440 * 2 ** ((midi - 69) / 12);

/** A seeded random generator (LCG), so every render is identical. */
export const seededRandom = (seed: number): (() => number) => {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
};

export type PlaceOptions = {
  /** Start time in seconds. */
  readonly at: number;
  readonly gain: number;
  /** -1 left … 0 centre … 1 right (equal-power). */
  readonly pan?: number;
};

/** Mix a mono sound into a stereo bus. */
export const place = (bus: Stereo, sound: Float32Array, options: PlaceOptions): void => {
  const angle = ((options.pan ?? 0) + 1) * (Math.PI / 4);
  const leftGain = Math.cos(angle) * options.gain;
  const rightGain = Math.sin(angle) * options.gain;
  const start = samplesOf(options.at);
  const end = Math.min(bus.left.length, start + sound.length);
  for (let index = Math.max(0, start); index < end; index++) {
    const value = sound[index - start] ?? 0;
    bus.left[index] = (bus.left[index] ?? 0) + value * leftGain;
    bus.right[index] = (bus.right[index] ?? 0) + value * rightGain;
  }
};

/** Add one stereo bus into another, scaled. */
export const mixInto = (target: Stereo, source: Stereo, gain: number): void => {
  for (let index = 0; index < target.left.length; index++) {
    target.left[index] = (target.left[index] ?? 0) + (source.left[index] ?? 0) * gain;
    target.right[index] = (target.right[index] ?? 0) + (source.right[index] ?? 0) * gain;
  }
};

/* ------------------------------------------------------------------ oscillators */

/** PolyBLEP correction: removes most of the aliasing a naive saw or square produces. */
const polyBlep = (phase: number, increment: number): number => {
  if (phase < increment) {
    const t = phase / increment;
    return t + t - t * t - 1;
  }
  if (phase > 1 - increment) {
    const t = (phase - 1) / increment;
    return t * t + t + t + 1;
  }
  return 0;
};

/** A band-limited sawtooth at `frequency`, `length` samples long, starting at phase `phase`. */
export const saw = (frequency: number, length: number, phase = 0): Float32Array => {
  const out = new Float32Array(length);
  const increment = frequency / SAMPLE_RATE;
  let position = phase % 1;
  for (let index = 0; index < length; index++) {
    out[index] = 2 * position - 1 - polyBlep(position, increment);
    position += increment;
    if (position >= 1) position -= 1;
  }
  return out;
};

export const sine = (frequency: number, length: number, phase = 0): Float32Array => {
  const out = new Float32Array(length);
  const step = (2 * Math.PI * frequency) / SAMPLE_RATE;
  for (let index = 0; index < length; index++) out[index] = Math.sin(phase + step * index);
  return out;
};

export const whiteNoise = (length: number, random: () => number): Float32Array => {
  const out = new Float32Array(length);
  for (let index = 0; index < length; index++) out[index] = random() * 2 - 1;
  return out;
};

/* -------------------------------------------------------------------- envelopes */

export type AdsrOptions = { readonly attack: number; readonly decay: number; readonly sustain: number; readonly release: number; readonly hold: number };

/** Attack-decay-sustain-release envelope; `hold` is how long the note is held before release (seconds). */
export const adsr = (options: AdsrOptions): Float32Array => {
  const total = samplesOf(options.hold + options.release);
  const out = new Float32Array(total);
  const attack = Math.max(1, samplesOf(options.attack));
  const decay = Math.max(1, samplesOf(options.decay));
  const holdEnd = samplesOf(options.hold);
  for (let index = 0; index < total; index++) {
    let level: number;
    if (index < attack) level = index / attack;
    else if (index < attack + decay) level = 1 - (1 - options.sustain) * ((index - attack) / decay);
    else level = options.sustain;
    if (index >= holdEnd) level *= Math.max(0, 1 - (index - holdEnd) / Math.max(1, samplesOf(options.release)));
    out[index] = level;
  }
  return out;
};

/** Exponential decay from 1 with time constant `tau` seconds, over `length` samples, with a short attack to avoid clicks. */
export const expDecay = (tau: number, length: number, attack = 0.001): Float32Array => {
  const out = new Float32Array(length);
  const attackSamples = Math.max(1, samplesOf(attack));
  for (let index = 0; index < length; index++) {
    out[index] = Math.min(1, index / attackSamples) * Math.exp(-seconds(index) / tau);
  }
  return out;
};

export const multiply = (signal: Float32Array, envelope: Float32Array): Float32Array => {
  const out = new Float32Array(Math.min(signal.length, envelope.length));
  for (let index = 0; index < out.length; index++) out[index] = (signal[index] ?? 0) * (envelope[index] ?? 0);
  return out;
};

export const sum = (...signals: readonly Float32Array[]): Float32Array => {
  const out = new Float32Array(Math.max(...signals.map((signal) => signal.length)));
  for (const signal of signals) for (let index = 0; index < signal.length; index++) out[index] = (out[index] ?? 0) + (signal[index] ?? 0);
  return out;
};

export const scale = (signal: Float32Array, gain: number): Float32Array => signal.map((value) => value * gain);

/* ---------------------------------------------------------------------- filters */

export type FilterType = "lowpass" | "highpass" | "bandpass";

/** RBJ biquad. `frequencyAt(index)` lets the cutoff move per sample (filter envelopes, sweeps). */
export const biquad = (input: Float32Array, type: FilterType, frequencyAt: (index: number) => number, q = 0.707): Float32Array => {
  const out = new Float32Array(input.length);
  let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
  let b0 = 0, b1 = 0, b2 = 0, a1 = 0, a2 = 0;
  const update = (frequency: number) => {
    const clamped = Math.min(SAMPLE_RATE * 0.45, Math.max(20, frequency));
    const omega = (2 * Math.PI * clamped) / SAMPLE_RATE;
    const alpha = Math.sin(omega) / (2 * q);
    const cos = Math.cos(omega);
    const a0 = 1 + alpha;
    if (type === "lowpass") { b0 = (1 - cos) / 2 / a0; b1 = (1 - cos) / a0; b2 = b0; }
    else if (type === "highpass") { b0 = (1 + cos) / 2 / a0; b1 = -(1 + cos) / a0; b2 = b0; }
    else { b0 = alpha / a0; b1 = 0; b2 = -alpha / a0; }
    a1 = (-2 * cos) / a0;
    a2 = (1 - alpha) / a0;
  };
  for (let index = 0; index < input.length; index++) {
    if (index % 16 === 0) update(frequencyAt(index));
    const x0 = input[index] ?? 0;
    const y0 = b0 * x0 + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2;
    x2 = x1; x1 = x0; y2 = y1; y1 = y0;
    out[index] = y0;
  }
  return out;
};

export const lowpass = (input: Float32Array, frequency: number, q?: number) => biquad(input, "lowpass", () => frequency, q);
export const highpass = (input: Float32Array, frequency: number, q?: number) => biquad(input, "highpass", () => frequency, q);
export const bandpass = (input: Float32Array, frequency: number, q?: number) => biquad(input, "bandpass", () => frequency, q);

/** Highpass a whole bus in place (clears low-mid mud from pads and returns). */
export const highpassBus = (bus: Stereo, frequency: number): Stereo => ({ left: highpass(bus.left, frequency), right: highpass(bus.right, frequency) });

/* ----------------------------------------------------------------- bus effects */

export type ReverbOptions = { readonly decay: number; readonly damping: number; readonly mix: number };

/** A Freeverb-style reverb: parallel damped combs then series allpasses, decorrelated per channel. */
export const reverb = (bus: Stereo, options: ReverbOptions): Stereo => {
  const combDelays = [1116, 1188, 1277, 1356, 1422, 1491, 1557, 1617];
  const allpassDelays = [556, 441, 341, 225];
  const channel = (input: Float32Array, spread: number): Float32Array => {
    const wet = new Float32Array(input.length);
    for (const delay of combDelays) {
      const size = delay + spread;
      const buffer = new Float32Array(size);
      let position = 0, filtered = 0;
      for (let index = 0; index < input.length; index++) {
        const output = buffer[position] ?? 0;
        filtered = output * (1 - options.damping) + filtered * options.damping;
        buffer[position] = (input[index] ?? 0) + filtered * options.decay;
        wet[index] = (wet[index] ?? 0) + output;
        position = (position + 1) % size;
      }
    }
    for (const delay of allpassDelays) {
      const size = delay + spread;
      const buffer = new Float32Array(size);
      let position = 0;
      for (let index = 0; index < wet.length; index++) {
        const buffered = buffer[position] ?? 0;
        const input = wet[index] ?? 0;
        wet[index] = buffered - input;
        buffer[position] = input + buffered * 0.5;
        position = (position + 1) % size;
      }
    }
    return wet.map((value) => value * 0.03);
  };
  const left = channel(bus.left, 0);
  const right = channel(bus.right, 23);
  return {
    left: bus.left.map((dry, index) => dry * (1 - options.mix) + (left[index] ?? 0) * options.mix),
    right: bus.right.map((dry, index) => dry * (1 - options.mix) + (right[index] ?? 0) * options.mix),
  };
};

export type DelayOptions = { readonly time: number; readonly feedback: number; readonly mix: number };

/** Ping-pong delay: echoes alternate between the channels. */
export const pingPong = (bus: Stereo, options: DelayOptions): Stereo => {
  const delay = samplesOf(options.time);
  const left = Float32Array.from(bus.left);
  const right = Float32Array.from(bus.right);
  for (let index = delay; index < left.length; index++) {
    left[index] = (left[index] ?? 0) + (right[index - delay] ?? 0) * options.feedback * options.mix;
    right[index] = (right[index] ?? 0) + (left[index - delay] ?? 0) * options.feedback * options.mix;
  }
  return { left, right };
};

/** Duck a bus by a 0-1 envelope (the kick's sidechain), by `depth`. */
export const duck = (bus: Stereo, envelope: Float32Array, depth: number): void => {
  for (let index = 0; index < bus.left.length; index++) {
    const gain = 1 - depth * (envelope[index] ?? 0);
    bus.left[index] = (bus.left[index] ?? 0) * gain;
    bus.right[index] = (bus.right[index] ?? 0) * gain;
  }
};

/** Glue the mix: soft saturation, then a look-ahead peak limiter to `ceiling` (linear). */
export const master = (bus: Stereo, ceiling = 0.89): Stereo => {
  const drive = (value: number) => Math.tanh(value * 1.4) / Math.tanh(1.4);
  const left = bus.left.map(drive);
  const right = bus.right.map(drive);
  const lookahead = samplesOf(0.005);
  const release = Math.exp(-1 / samplesOf(0.08));
  let gain = 1;
  for (let index = 0; index < left.length; index++) {
    let peak = 0;
    for (let ahead = index; ahead < Math.min(left.length, index + lookahead); ahead += 8) {
      peak = Math.max(peak, Math.abs(left[ahead] ?? 0), Math.abs(right[ahead] ?? 0));
    }
    const target = peak > ceiling ? ceiling / peak : 1;
    gain = target < gain ? target : target - (target - gain) * release;
    left[index] = (left[index] ?? 0) * gain;
    right[index] = (right[index] ?? 0) * gain;
  }
  return { left, right };
};

/** Fade in and out (seconds), in place. */
export const fade = (bus: Stereo, fadeIn: number, fadeOut: number): void => {
  const inSamples = samplesOf(fadeIn), outSamples = samplesOf(fadeOut);
  for (let index = 0; index < bus.left.length; index++) {
    const gain = Math.min(1, index / Math.max(1, inSamples), (bus.left.length - index) / Math.max(1, outSamples));
    bus.left[index] = (bus.left[index] ?? 0) * gain;
    bus.right[index] = (bus.right[index] ?? 0) * gain;
  }
};
