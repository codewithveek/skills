// Measuring and setting levels, and writing the result: true peak and integrated loudness as defined by
// ITU-R BS.1770-4 (what YouTube, streaming services and ffmpeg's ebur128 filter measure), and a 16-bit WAV
// writer that normalises to either. Music is normalised by loudness so tracks of any tempo or length sit
// at the same level under the voice; sound effects by true peak.
import { writeFileSync } from "node:fs";
import { SAMPLE_RATE, type Stereo } from "./synth.mts";

/* --------------------------------------------------------------- true peak */

// 4× oversampling taps (Hann-windowed sinc, 8 input samples per side).
const OVERSAMPLE = 4;
const HALF_TAPS = 8;
const INTERPOLATION_TAPS: readonly Float64Array[] = Array.from({ length: OVERSAMPLE - 1 }, (_, phaseIndex) => {
  const fraction = (phaseIndex + 1) / OVERSAMPLE;
  const taps = new Float64Array(HALF_TAPS * 2);
  for (let tap = 0; tap < taps.length; tap++) {
    const distance = tap - (HALF_TAPS - 1) - fraction;
    const sinc = distance === 0 ? 1 : Math.sin(Math.PI * distance) / (Math.PI * distance);
    taps[tap] = sinc * (0.5 + 0.5 * Math.cos((Math.PI * distance) / HALF_TAPS));
  }
  return taps;
});

const channelTruePeak = (channel: Float32Array): number => {
  let peak = 0;
  for (let index = 0; index < channel.length; index++) {
    peak = Math.max(peak, Math.abs(channel[index] ?? 0));
    for (const taps of INTERPOLATION_TAPS) {
      let value = 0;
      for (let tap = 0; tap < taps.length; tap++) value += (channel[index + tap - (HALF_TAPS - 1)] ?? 0) * (taps[tap] ?? 0);
      peak = Math.max(peak, Math.abs(value));
    }
  }
  return peak;
};

/** The highest inter-sample peak of a bus (linear), estimated by 4× oversampling. */
export const truePeak = (bus: Stereo): number => Math.max(channelTruePeak(bus.left), channelTruePeak(bus.right), 1e-9);

/* ---------------------------------------------------------------- loudness */

type BiquadCoefficients = { readonly b0: number; readonly b1: number; readonly b2: number; readonly a1: number; readonly a2: number };

/** BS.1770 stage 1: a +4 dB high shelf at 1.5 kHz (the head's acoustic effect). */
const highShelf = (): BiquadCoefficients => {
  const gain = 10 ** (4 / 40), omega = (2 * Math.PI * 1500) / SAMPLE_RATE, cos = Math.cos(omega);
  const alpha = Math.sin(omega) / (2 * Math.SQRT1_2), root = 2 * Math.sqrt(gain) * alpha;
  const a0 = gain + 1 - (gain - 1) * cos + root;
  return {
    b0: (gain * (gain + 1 + (gain - 1) * cos + root)) / a0,
    b1: (-2 * gain * (gain - 1 + (gain + 1) * cos)) / a0,
    b2: (gain * (gain + 1 + (gain - 1) * cos - root)) / a0,
    a1: (2 * (gain - 1 - (gain + 1) * cos)) / a0,
    a2: (gain + 1 - (gain - 1) * cos - root) / a0,
  };
};

/** BS.1770 stage 2: a high pass at 38 Hz (the RLB weighting). */
const lowCut = (): BiquadCoefficients => {
  const omega = (2 * Math.PI * 38) / SAMPLE_RATE, cos = Math.cos(omega), alpha = Math.sin(omega) / (2 * 0.5), a0 = 1 + alpha;
  return { b0: (1 + cos) / 2 / a0, b1: -(1 + cos) / a0, b2: (1 + cos) / 2 / a0, a1: (-2 * cos) / a0, a2: (1 - alpha) / a0 };
};

const applyBiquad = (input: Float32Array, coefficients: BiquadCoefficients): Float32Array => {
  const { b0, b1, b2, a1, a2 } = coefficients;
  const out = new Float32Array(input.length);
  let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
  for (let index = 0; index < input.length; index++) {
    const x0 = input[index] ?? 0;
    const y0 = b0 * x0 + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2;
    x2 = x1; x1 = x0; y2 = y1; y1 = y0;
    out[index] = y0;
  }
  return out;
};

const kWeighted = (channel: Float32Array): Float32Array => applyBiquad(applyBiquad(channel, highShelf()), lowCut());

/** Mean square of each 400 ms block, stepping 100 ms (75% overlap). */
const blockPowers = (channel: Float32Array): Float64Array => {
  const block = Math.round(0.4 * SAMPLE_RATE), step = Math.round(0.1 * SAMPLE_RATE);
  const count = Math.max(0, Math.floor((channel.length - block) / step) + 1);
  const powers = new Float64Array(count);
  for (let blockIndex = 0; blockIndex < count; blockIndex++) {
    let total = 0;
    for (let offset = 0; offset < block; offset++) total += (channel[blockIndex * step + offset] ?? 0) ** 2;
    powers[blockIndex] = total / block;
  }
  return powers;
};

const toLufs = (power: number): number => -0.691 + 10 * Math.log10(Math.max(power, 1e-12));

/** Integrated loudness (LUFS) with BS.1770's absolute (−70 LUFS) and relative (−10 LU) gates. */
export const integratedLoudness = (bus: Stereo): number => {
  const left = blockPowers(kWeighted(bus.left)), right = blockPowers(kWeighted(bus.right));
  const summed = Float64Array.from(left, (power, index) => power + (right[index] ?? 0));
  const gatedMean = (threshold: number): number => {
    const kept = summed.filter((power) => toLufs(power) > threshold);
    return kept.length === 0 ? 1e-12 : kept.reduce((total, power) => total + power, 0) / kept.length;
  };
  const relativeGate = toLufs(gatedMean(-70)) - 10;
  return toLufs(gatedMean(Math.max(-70, relativeGate)));
};

/* ------------------------------------------------------------------ writing */

/** 0.89 linear ≈ −1 dBTP: the ceiling streaming services and AAC encoders need to avoid clipping. */
export const TRUE_PEAK_CEILING = 0.89;

export type WavLevel =
  /** Scale so the true peak sits at `ceiling` (linear). */
  | { readonly kind: "true-peak"; readonly ceiling: number }
  /** Scale to `lufs` integrated, unless that would push the true peak past `ceiling`. */
  | { readonly kind: "loudness"; readonly lufs: number; readonly ceiling: number }
  /** Write the samples unchanged (stems for analysis). */
  | { readonly kind: "as-is" };

export type WriteWavOptions = { readonly path: string; readonly bus: Stereo; readonly level?: WavLevel };

const gainFor = (bus: Stereo, level: WavLevel): number => {
  if (level.kind === "as-is") return 1;
  const peakGain = level.ceiling / truePeak(bus);
  if (level.kind === "true-peak") return peakGain;
  return Math.min(peakGain, 10 ** ((level.lufs - integratedLoudness(bus)) / 20));
};

/** Write a 16-bit stereo WAV, levelled as asked (default: true peak at −1 dBTP). Returns the gain applied. */
export const writeWav = ({ path, bus, level = { kind: "true-peak", ceiling: TRUE_PEAK_CEILING } }: WriteWavOptions): number => {
  const gain = gainFor(bus, level);
  const frames = bus.left.length;
  const buffer = Buffer.alloc(44 + frames * 4);
  buffer.write("RIFF", 0); buffer.writeUInt32LE(36 + frames * 4, 4); buffer.write("WAVE", 8);
  buffer.write("fmt ", 12); buffer.writeUInt32LE(16, 16); buffer.writeUInt16LE(1, 20); buffer.writeUInt16LE(2, 22);
  buffer.writeUInt32LE(SAMPLE_RATE, 24); buffer.writeUInt32LE(SAMPLE_RATE * 4, 28); buffer.writeUInt16LE(4, 32); buffer.writeUInt16LE(16, 34);
  buffer.write("data", 36); buffer.writeUInt32LE(frames * 4, 40);
  const toInt16 = (value: number) => Math.max(-32768, Math.min(32767, Math.round(value * gain * 32767)));
  for (let index = 0; index < frames; index++) {
    buffer.writeInt16LE(toInt16(bus.left[index] ?? 0), 44 + index * 4);
    buffer.writeInt16LE(toInt16(bus.right[index] ?? 0), 46 + index * 4);
  }
  writeFileSync(path, buffer);
  return gain;
};
