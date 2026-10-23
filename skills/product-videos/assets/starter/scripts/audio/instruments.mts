// Instruments for the generated music and sound effects. Each returns one hit or note as mono
// samples; tracks.mts places them in time. Tuned against a measured professional launch video
// (132 BPM, ~75% of energy under 250 Hz, bright 2–6 kHz top, syncopated percussion).
import {
  bandpass, biquad, expDecay, highpass, lowpass, midiToHz, multiply, SAMPLE_RATE, samplesOf, saw, scale, seconds, sine, sum, whiteNoise,
} from "./synth.mts";

export type Random = () => number;

/**
 * Four-on-the-floor kick: a driven sine pitched down fast (body, ~250 ms), a short click on top (attack).
 * The body is kept short so the low end reads as hits, not a held tone: the measured references put a
 * quarter to a third of their energy in transients.
 */
export const kick = (random: Random, punch = 1): Float32Array => {
  const length = samplesOf(0.34);
  const body = new Float32Array(length);
  let phase = 0;
  for (let index = 0; index < length; index++) {
    const time = seconds(index);
    const frequency = 50 + 140 * Math.exp(-time * 45) + 26 * Math.exp(-time * 12);
    phase += (2 * Math.PI * frequency) / SAMPLE_RATE;
    body[index] = Math.sin(phase) * Math.exp(-time * 11) * Math.min(1, index / 24);
  }
  const clickLength = samplesOf(0.014);
  const click = multiply(highpass(whiteNoise(clickLength, random), 2200), expDecay(0.0025, clickLength, 0.0002));
  return sum(scale(body.map((value) => Math.tanh(value * 2.2)), 0.95), scale(click, 0.6 * punch));
};

/** A clap: three quick noise bursts and a short room tail, centred around 1.2–2 kHz. */
export const clap = (random: Random): Float32Array => {
  const length = samplesOf(0.32);
  const noise = bandpass(whiteNoise(length, random), 1500, 0.9);
  const envelope = new Float32Array(length);
  for (let index = 0; index < length; index++) {
    const time = seconds(index);
    const bursts = [0, 0.011, 0.022].reduce((level, start) => level + (time >= start ? Math.exp(-(time - start) / 0.006) : 0), 0);
    envelope[index] = Math.min(1, bursts) * 0.8 + (time > 0.022 ? Math.exp(-(time - 0.022) / 0.09) * 0.55 : 0);
  }
  const bright = highpass(whiteNoise(length, random), 5000);
  return sum(multiply(noise, envelope), scale(multiply(bright, expDecay(0.03, length)), 0.18));
};

/** Closed hi-hat (short) or open hi-hat (long): high-passed noise with a metallic ring. */
export const hat = (random: Random, open = false): Float32Array => {
  const length = samplesOf(open ? 0.28 : 0.06);
  const noise = highpass(whiteNoise(length, random), 7000, 0.8);
  const ring = sum(...[5200, 7400, 9100, 11800].map((frequency) => scale(sine(frequency, length, random() * 6), 0.08)));
  return multiply(sum(noise, ring), expDecay(open ? 0.09 : 0.016, length, 0.0005));
};

/** A shaker grain: band-passed noise with a soft attack, for syncopated 16ths. */
export const shaker = (random: Random): Float32Array => {
  const length = samplesOf(0.07);
  return multiply(bandpass(whiteNoise(length, random), 6500, 1.4), expDecay(0.02, length, 0.008));
};

/** A sub-bass note: sine at the root plus a soft second harmonic, with a plucky filtered saw on top. */
export const bass = (midi: number, duration: number): Float32Array => {
  const length = samplesOf(duration);
  const frequency = midiToHz(midi);
  const subLayer = sum(sine(frequency, length), scale(sine(frequency * 2, length), 0.18));
  const grit = biquad(saw(frequency, length), "lowpass", (index) => 180 + 900 * Math.exp(-seconds(index) * 14), 1.1);
  const envelope = new Float32Array(length);
  for (let index = 0; index < length; index++) {
    envelope[index] = Math.min(1, index / samplesOf(0.004)) * Math.min(1, (length - index) / samplesOf(0.02)) * (0.75 + 0.25 * Math.exp(-seconds(index) * 6));
  }
  return multiply(sum(scale(subLayer, 0.9), scale(grit, 0.35)), envelope);
};

/** A bright chord stab: five detuned saws per note, a fast filter sweep, short decay (supersaw pluck). */
export const pluckChord = (notes: readonly number[], duration: number, random: Random, brightness = 1): Float32Array => {
  const length = samplesOf(duration + 0.25);
  const voices: Float32Array[] = [];
  for (const midi of notes) {
    for (const detune of [-0.11, -0.05, 0, 0.05, 0.11]) {
      voices.push(scale(saw(midiToHz(midi + detune), length, random()), 0.12));
    }
  }
  const raw = sum(...voices);
  const filtered = biquad(raw, "lowpass", (index) => 700 + 7200 * brightness * Math.exp(-seconds(index) * 9), 1.3);
  return multiply(highpass(filtered, 220), expDecay(duration * 0.55, length, 0.002));
};

/** A bell-like FM pluck for arpeggios: adds the sparkle in the 2–8 kHz range. */
export const bell = (midi: number, duration: number): Float32Array => {
  const length = samplesOf(duration);
  const carrier = midiToHz(midi);
  const out = new Float32Array(length);
  for (let index = 0; index < length; index++) {
    const time = seconds(index);
    const modulation = Math.sin(2 * Math.PI * carrier * 3.5 * time) * 2.4 * Math.exp(-time * 10);
    out[index] = Math.sin(2 * Math.PI * carrier * time + modulation) * Math.exp(-time * 6) * Math.min(1, index / 40);
  }
  return out;
};

/** A soft electric piano (two-operator FM, tine-like attack) for the calm bed. */
export const electricPiano = (midi: number, duration: number): Float32Array => {
  const length = samplesOf(duration + 0.6);
  const carrier = midiToHz(midi);
  const out = new Float32Array(length);
  for (let index = 0; index < length; index++) {
    const time = seconds(index);
    const tine = Math.sin(2 * Math.PI * carrier * 14 * time) * 0.6 * Math.exp(-time * 30);
    const modulation = Math.sin(2 * Math.PI * carrier * time) * 1.1 * Math.exp(-time * 2.5);
    const release = time > duration ? Math.exp(-(time - duration) * 8) : 1;
    out[index] = (Math.sin(2 * Math.PI * carrier * time + modulation) + tine * 0.25) * Math.exp(-time * 1.4) * release * Math.min(1, index / 60);
  }
  return out;
};

/** A soft pad held under the harmony, high-passed so it adds air without low-mid mud. */
export const pad = (notes: readonly number[], duration: number, random: Random): Float32Array => {
  const length = samplesOf(duration + 0.8);
  const voices = notes.flatMap((midi) => [-0.08, 0.08].map((detune) => scale(saw(midiToHz(midi + detune), length, random()), 0.08)));
  const filtered = lowpass(highpass(sum(...voices), 400), 2600, 0.6);
  const envelope = new Float32Array(length);
  const attack = samplesOf(0.35), hold = samplesOf(duration);
  for (let index = 0; index < length; index++) {
    envelope[index] = Math.min(1, index / attack) * (index > hold ? Math.max(0, 1 - (index - hold) / samplesOf(0.8)) : 1);
  }
  return multiply(filtered, envelope);
};

/** A white-noise riser: a band-pass sweeping up over `duration`, getting louder into the downbeat. */
export const riser = (duration: number, random: Random): Float32Array => {
  const length = samplesOf(duration);
  const swept = biquad(whiteNoise(length, random), "bandpass", (index) => 300 * (9000 / 300) ** (index / length), 2.2);
  const envelope = new Float32Array(length);
  for (let index = 0; index < length; index++) envelope[index] = (index / length) ** 2.2;
  return multiply(swept, envelope);
};

/** An impact on a downbeat: a sub drop and a noise splash. */
export const impact = (random: Random): Float32Array => {
  const length = samplesOf(1.4);
  const drop = new Float32Array(length);
  let phase = 0;
  for (let index = 0; index < length; index++) {
    const time = seconds(index);
    phase += (2 * Math.PI * (70 * Math.exp(-time * 1.6) + 28)) / SAMPLE_RATE;
    drop[index] = Math.sin(phase) * Math.exp(-time * 2.4);
  }
  const splash = multiply(biquad(whiteNoise(length, random), "lowpass", (index) => 9000 * Math.exp(-seconds(index) * 2.5) + 400), expDecay(0.35, length, 0.002));
  return sum(scale(drop, 0.8), scale(splash, 0.35));
};
