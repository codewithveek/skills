// The two generated music tracks, arranged bar by bar.
//   upbeat: vibrant minor-key pop-house at 128 BPM (launches, showcase, graphic, studio)
//   bed:    a calm, modern beat at 100 BPM (editorial, cinematic, tutorials)
// Targets come from a measured launch video: ~130 BPM, most energy in kick and sub (under 250 Hz),
// a bright 2–6 kHz top from claps, hats and plucks, and syncopated 16th percussion.
import { bass, bell, clap, electricPiano, hat, impact, kick, pad, pluckChord, riser, shaker } from "./instruments.mts";
import {
  createStereo, duck, fade, highpassBus, master, mixInto, pingPong, place, reverb, samplesOf, seconds, seededRandom, type Stereo,
} from "./synth.mts";

export type TrackOptions = {
  readonly seconds: number;
  readonly bpm: number;
  readonly seed: number;
  /** Per-stem gains; defaults to the fitted mix. Used when re-fitting the mix (MUSIC_STEMS). */
  readonly gains?: Readonly<Record<string, number>>;
  /** Called with each stem before mixing (MUSIC_STEMS writes them out for analysis). */
  readonly onStem?: (name: string, stem: Stereo) => void;
};

type UpbeatStems = { kick: Stereo; hats: Stereo; claps: Stereo; bass: Stereo; chords: Stereo; arp: Stereo; fx: Stereo };
type BedStems = { kick: Stereo; hats: Stereo; low: Stereo; keys: Stereo; sparkle: Stereo };

// Stem gains, fitted so each track's band balance matches its target (references/audio.md):
//   upbeat → the mean of two measured music-led launches: 34% sub, 47% bass, 14% low mids, 3.5% presence
//   bed    → a calmer measured launch, a little brighter: 8% sub, 57% bass, 30% low mids, 3.5% presence
// Fitted on the stems (MUSIC_STEMS) with the kick fixed at 1, claps ≥ 0.5 and effects ≥ 0.4 so they stay audible,
// plus a transient target: 20–22% of the energy is percussive (the references measure 14–34%), so the low end
// hits rather than drones. Measured result: upbeat 26% sub / 55% bass / 15% low mids, 3.2 kHz centroid.
export const UPBEAT_MIX: Readonly<Record<keyof UpbeatStems, number>> = { kick: 1, hats: 1.54, claps: 0.5, bass: 1.23, chords: 5.28, arp: 4.39, fx: 1 };
export const BED_MIX: Readonly<Record<keyof BedStems, number>> = { kick: 1, hats: 2.18, low: 0.2, keys: 3.95, sparkle: 5.4 };

let stemHook: TrackOptions["onStem"];
const mixStems = (stems: Readonly<Record<string, Stereo>>, gains: Readonly<Record<string, number>>, length: number, fadeIn: number): Stereo => {
  const mix = createStereo(length);
  for (const [name, stem] of Object.entries(stems)) {
    stemHook?.(name, stem);
    mixInto(mix, stem, gains[name] ?? 1);
  }
  const finished = master(mix);
  fade(finished, fadeIn, 3);
  return finished;
};

type Section = "intro" | "groove" | "lift" | "break";

/** Bars 0–3 intro, then a repeating 16-bar cycle: 8 groove, 6 lift (with arpeggio), 2 break (riser, no kick). */
const sectionOf = (bar: number): Section => {
  if (bar < 4) return "intro";
  const position = (bar - 4) % 16;
  if (position < 8) return "groove";
  if (position < 14) return "lift";
  return "break";
};

/** Kick sidechain: 1 at each kick, falling to 0 over ~200 ms. Multiplied into the bass and chord buses. */
const sidechainEnvelope = (length: number, kickTimes: readonly number[]): Float32Array => {
  const envelope = new Float32Array(length);
  const release = samplesOf(0.2);
  for (const time of kickTimes) {
    const start = samplesOf(time);
    for (let offset = 0; offset < release && start + offset < length; offset++) {
      const value = Math.cos((offset / release) * (Math.PI / 2)) ** 2;
      envelope[start + offset] = Math.max(envelope[start + offset] ?? 0, value);
    }
  }
  return envelope;
};

// E minor: Em – C – G – D (vi IV I V of G major). Stab voicings sit around E4–C5; bass roots low for sub.
const UPBEAT_CHORDS: readonly { readonly stab: readonly number[]; readonly root: number; readonly arp: readonly number[] }[] = [
  { stab: [64, 67, 71], root: 28, arp: [76, 79, 83, 79] },
  { stab: [64, 67, 72], root: 36, arp: [76, 79, 84, 79] },
  { stab: [62, 67, 71], root: 31, arp: [74, 79, 83, 79] },
  { stab: [62, 66, 69], root: 38, arp: [74, 78, 81, 78] },
];

export const renderUpbeat = (options: TrackOptions): Stereo => {
  stemHook = options.onStem;
  const random = seededRandom(options.seed);
  const beat = 60 / options.bpm, bar = beat * 4, sixteenth = beat / 4;
  const kickBus = createStereo(options.seconds), hatBus = createStereo(options.seconds), bassBus = createStereo(options.seconds), chords = createStereo(options.seconds);
  const arp = createStereo(options.seconds), fx = createStereo(options.seconds), claps = createStereo(options.seconds);
  const kicks: number[] = [];
  const bars = Math.ceil(options.seconds / bar);
  for (let barIndex = 0; barIndex < bars; barIndex++) {
    const section = sectionOf(barIndex);
    const nextSection = sectionOf(barIndex + 1);
    const harmony = UPBEAT_CHORDS[barIndex % UPBEAT_CHORDS.length]!;
    const t0 = barIndex * bar;
    const full = section === "groove" || section === "lift";

    // Drums: four-on-the-floor kick, claps on 2 and 4, offbeat hats with 16th ghosts, shaker
    if (full) for (let step = 0; step < 4; step++) { place(kickBus, kick(random), { at: t0 + step * beat, gain: 0.95 }); kicks.push(t0 + step * beat); }
    if (full) for (const step of [1, 3]) place(claps, clap(random), { at: t0 + step * beat, gain: 0.5 });
    for (let step = 0; step < 16; step++) {
      const at = t0 + step * sixteenth;
      const offbeat = step % 4 === 2;
      if (section === "intro" && step % 2 === 1) continue;
      if (offbeat) place(hatBus, hat(random, section === "lift"), { at, gain: section === "lift" ? 0.16 : 0.24, pan: 0.18 });
      else if (step % 2 === 1 && section !== "break") place(hatBus, hat(random), { at, gain: 0.07 + 0.06 * random(), pan: -0.22 });
      if (full && step % 2 === 1) place(hatBus, shaker(random), { at: at + 0.006, gain: 0.07 + 0.04 * random(), pan: 0.4 });
    }

    // Bass: offbeat 8ths with a 16th pickup, the house pump; silent in the intro and break
    if (full) for (const step of [2, 6, 10, 14, 15]) {
      place(bassBus, bass(harmony.root + (step === 15 ? 12 : 0), sixteenth * (step === 15 ? 0.8 : 1.3)), { at: t0 + step * sixteenth, gain: step === 15 ? 0.35 : 0.62 });
    }

    // Chord stabs on a syncopated 16th rhythm; filtered darker in the intro and break
    const brightness = section === "intro" ? 0.35 : section === "break" ? 0.55 : 1;
    for (const step of [0, 3, 6, 10, 13]) {
      place(chords, pluckChord(harmony.stab, sixteenth * 2.2, random, brightness), { at: t0 + step * sixteenth, gain: 0.3, pan: step % 2 ? 0.5 : -0.5 });
    }
    place(chords, pad(harmony.stab.map((note) => note + 12), bar, random), { at: t0, gain: section === "break" ? 0.16 : 0.08 });

    // Bell arpeggio in the lift: chord tones an octave up, 16ths, alternating sides
    if (section === "lift") for (let step = 0; step < 16; step++) {
      place(arp, bell(harmony.arp[step % harmony.arp.length]!, sixteenth * 1.6), { at: t0 + step * sixteenth, gain: step % 4 === 0 ? 0.13 : 0.09, pan: step % 2 ? 0.8 : -0.8 });
    }

    // Transitions: a 2-bar riser into each new groove, an impact on its downbeat, a clap fill before it
    if (section !== "break" && section !== "intro" && nextSection === "break") {
      for (const step of [12, 13, 14, 15]) place(claps, clap(random), { at: t0 + step * sixteenth, gain: 0.18 + 0.06 * (step - 12) });
    }
    if ((section === "break" || section === "intro") && (nextSection === "groove") && (barIndex === 3 || (barIndex - 4) % 16 === 15)) {
      place(fx, riser(bar * 2, random), { at: t0 - bar, gain: 0.32 });
      place(fx, impact(random), { at: t0 + bar, gain: 0.55 });
    }
  }

  const length = kickBus.left.length;
  const sidechain = sidechainEnvelope(length, kicks);
  duck(bassBus, sidechain, 0.8);
  duck(chords, sidechain, 0.55);
  const stems: UpbeatStems = {
    kick: kickBus,
    hats: hatBus,
    claps: reverb(claps, { decay: 0.78, damping: 0.45, mix: 0.18 }),
    bass: bassBus,
    chords: highpassBus(reverb(chords, { decay: 0.82, damping: 0.35, mix: 0.24 }), 180),
    arp: reverb(pingPong(arp, { time: sixteenth * 3, feedback: 0.45, mix: 0.6 }), { decay: 0.8, damping: 0.3, mix: 0.25 }),
    fx,
  };
  return mixStems(stems, options.gains ?? UPBEAT_MIX, options.seconds, 0.05);
};

// C major colours for the calm bed: Cmaj7 – Am7 – Fmaj7 – G6, electric piano voicings, low roots
const BED_CHORDS: readonly { readonly keys: readonly number[]; readonly root: number; readonly arp: readonly number[] }[] = [
  { keys: [52, 55, 59, 64], root: 36, arp: [72, 76, 79, 83] },
  { keys: [52, 55, 57, 60], root: 33, arp: [69, 72, 76, 79] },
  { keys: [53, 57, 60, 64], root: 29, arp: [69, 72, 77, 81] },
  { keys: [55, 59, 62, 64], root: 31, arp: [71, 74, 79, 83] },
];

export const renderBed = (options: TrackOptions): Stereo => {
  stemHook = options.onStem;
  const random = seededRandom(options.seed);
  const beat = 60 / options.bpm, bar = beat * 4, eighth = beat / 2;
  const kickBus = createStereo(options.seconds), hatBus = createStereo(options.seconds), low = createStereo(options.seconds), keys = createStereo(options.seconds), sparkle = createStereo(options.seconds);
  const kicks: number[] = [];
  const bars = Math.ceil(options.seconds / bar);
  for (let barIndex = 0; barIndex < bars; barIndex++) {
    const harmony = BED_CHORDS[barIndex % BED_CHORDS.length]!;
    const t0 = barIndex * bar;
    const drumsIn = barIndex >= 2;
    if (drumsIn) {
      for (const step of [0, 2.5]) { place(kickBus, kick(random, 0.4), { at: t0 + step * beat, gain: step === 0 ? 0.62 : 0.4 }); kicks.push(t0 + step * beat); }
      for (const step of [1, 3]) place(hatBus, clap(random), { at: t0 + step * beat, gain: 0.2 });
      for (let step = 0; step < 8; step++) {
        const swing = step % 2 ? eighth * 0.16 : 0;
        place(hatBus, hat(random), { at: t0 + step * eighth + swing, gain: step % 2 ? 0.08 : 0.13, pan: 0.2 });
      }
    }
    place(low, bass(harmony.root, bar * 0.95), { at: t0, gain: 0.42 });
    place(keys, electricPiano(harmony.keys[0]!, bar * 0.9), { at: t0, gain: 0.1 });
    for (const [index, note] of harmony.keys.slice(1).entries()) place(keys, electricPiano(note, bar * 0.85), { at: t0 + 0.012 * (index + 1), gain: 0.09, pan: index % 2 ? 0.2 : -0.2 });
    if (barIndex % 2 === 1) for (let step = 0; step < 8; step++) {
      place(sparkle, bell(harmony.arp[step % harmony.arp.length]!, eighth * 1.8), { at: t0 + step * eighth, gain: 0.055, pan: step % 2 ? 0.5 : -0.5 });
    }
  }
  const length = kickBus.left.length;
  duck(low, sidechainEnvelope(length, kicks), 0.4);
  const stems: BedStems = {
    kick: kickBus,
    hats: hatBus,
    low,
    keys: highpassBus(reverb(keys, { decay: 0.84, damping: 0.4, mix: 0.3 }), 140),
    sparkle: reverb(pingPong(sparkle, { time: eighth * 1.5, feedback: 0.4, mix: 0.55 }), { decay: 0.82, damping: 0.3, mix: 0.3 }),
  };
  return mixStems(stems, options.gains ?? BED_MIX, options.seconds, 0.3);
};

export const describeLength = (bus: Stereo): string => `${seconds(bus.left.length).toFixed(1)} s`;
