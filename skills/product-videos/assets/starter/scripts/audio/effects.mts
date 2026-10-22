// The kit's sound effects, synthesised so they carry no licence. Each returns a stereo sound that starts
// at sample 0. Timings are set by where the kit plays them:
//   whoosh  starts 3 frames before a crossfade and peaks ~0.3 s in, mid-transition (build.tsx Whooshes)
//   click   lands on the cursor's click frame (Cursor.tsx); press and release, like a trackpad
//   pop     for an element landing on screen (a chip, a badge, a word); peaks within 15 ms
import { bandpass, biquad, createStereo, expDecay, highpass, multiply, reverb, SAMPLE_RATE, samplesOf, scale, seconds, sum, whiteNoise, type Stereo } from "./synth.mts";

type Random = () => number;

const WHOOSH_SECONDS = 0.62;
const WHOOSH_PEAK = 0.3;

/** 0 → 1 → 0: an eased swell to the peak, then a quick exponential fall. */
const swell = (time: number): number =>
  time < WHOOSH_PEAK ? (time / WHOOSH_PEAK) ** 2.2 : Math.exp(-(time - WHOOSH_PEAK) / 0.085);

/** One channel of the whoosh: band-passed noise whose centre rises with loudness (a Doppler-like brightening), plus air. */
const whooshChannel = (random: Random): Float32Array => {
  const length = samplesOf(WHOOSH_SECONDS);
  const envelope = Float32Array.from({ length }, (_, index) => swell(seconds(index)));
  const body = biquad(whiteNoise(length, random), "bandpass", (index) => 380 + 4400 * (envelope[index] ?? 0), 0.9);
  const air = highpass(whiteNoise(length, random), 6500);
  const airEnvelope = envelope.map((value) => value ** 1.6);
  return sum(multiply(body, envelope), scale(multiply(air, airEnvelope), 0.22));
};

/** A low thump under the whoosh's peak, so transitions have weight on large speakers. */
const whooshThump = (): Float32Array => {
  const length = samplesOf(WHOOSH_SECONDS);
  const out = new Float32Array(length);
  let phase = 0;
  for (let index = 0; index < length; index++) {
    const time = seconds(index) - WHOOSH_PEAK + 0.04;
    if (time < 0) continue;
    phase += (2 * Math.PI * (55 + 45 * Math.exp(-time * 18))) / SAMPLE_RATE;
    out[index] = Math.sin(phase) * Math.exp(-time * 14) * Math.min(1, time / 0.008);
  }
  return out;
};

/** An airy swept whoosh that travels left to right (equal-power pan), peaking mid-crossfade. */
export const whoosh = (random: Random): Stereo => {
  const left = whooshChannel(random), right = whooshChannel(random), thump = whooshThump();
  const bus = createStereo(WHOOSH_SECONDS);
  for (let index = 0; index < bus.left.length; index++) {
    const travel = Math.min(1, seconds(index) / WHOOSH_SECONDS);
    const angle = (0.2 + 0.6 * travel * travel * (3 - 2 * travel)) * (Math.PI / 2);
    bus.left[index] = (left[index] ?? 0) * Math.cos(angle) * 1.2 + (thump[index] ?? 0) * 0.35;
    bus.right[index] = (right[index] ?? 0) * Math.sin(angle) * 1.2 + (thump[index] ?? 0) * 0.35;
  }
  return reverb(bus, { decay: 0.7, damping: 0.4, mix: 0.14 });
};

/** A tick: band-passed noise with a very fast decay. */
const tick = (random: Random, frequency: number, length: number): Float32Array =>
  multiply(bandpass(whiteNoise(length, random), frequency, 1.3), expDecay(0.0035, length, 0.0002));

/** A short low knock, the body of a press. */
const knock = (length: number): Float32Array =>
  Float32Array.from({ length }, (_, index) => Math.sin(2 * Math.PI * 210 * seconds(index)) * Math.exp(-seconds(index) / 0.011));

/** A crisp trackpad click: press (tick plus a low knock), then a lighter, higher release 45 ms later. */
export const click = (random: Random): Stereo => {
  const length = samplesOf(0.12);
  const press = sum(tick(random, 4200, length), scale(knock(length), 0.18));
  const release = scale(tick(random, 5600, length), 0.45);
  const releaseAt = samplesOf(0.045);
  const mono = Float32Array.from(press, (value, index) => value + (index >= releaseAt ? release[index - releaseAt] ?? 0 : 0));
  return { left: mono, right: Float32Array.from(mono) };
};

/** A bubbly pop: a sine gliding up fast (380 → 1100 Hz), a soft second harmonic, a tiny transient on top. */
export const pop = (random: Random): Stereo => {
  const length = samplesOf(0.2);
  const tone = new Float32Array(length);
  let phase = 0;
  for (let index = 0; index < length; index++) {
    const time = seconds(index);
    phase += (2 * Math.PI * (1100 - 720 * Math.exp(-time / 0.012))) / SAMPLE_RATE;
    tone[index] = (Math.sin(phase) + 0.15 * Math.sin(2 * phase)) * Math.exp(-time / 0.045) * Math.min(1, index / samplesOf(0.0015));
  }
  const transientLength = samplesOf(0.01);
  const transient = multiply(highpass(whiteNoise(transientLength, random), 3000), expDecay(0.0015, transientLength, 0.0001));
  const mono = Float32Array.from(tone, (value, index) => value + 0.25 * (transient[index] ?? 0));
  return reverb({ left: mono, right: Float32Array.from(mono) }, { decay: 0.6, damping: 0.5, mix: 0.08 });
};
