// Synthesises background music, so the videos carry no third-party licence. One preset per need:
//   bed        calm bed for tutorials: pads, plucked arpeggio, bass                       92 bpm
//   upbeat     the bed's harmony with a kick and hats, for Studio launches               104 bpm
//   editorial  warm and bright: electric-piano chords, light pluck, soft kick and hats    88 bpm
//   graphic    electronic pulse: four-on-the-floor, clap, 16th hats, arp, pumping pads   120 bpm
//   cinematic  slow and wide: long pads, a low drone, sparse bells, no drums              68 bpm
// Each writes public/music/<preset>.wav and <preset>.beats.json (bpm, beat and bar length, so scenes
// can be cut on the beat with src/kit/beats.ts).
//
// Run: npm run music                  every preset
//      npm run music -- graphic       one preset
//      MUSIC_SEED=3 npm run music     a variation: another key, chord order and arpeggio
//      MUSIC_SECONDS=60 npm run music length (default 90; longer than the video, the mix fades it out)
// To use a real track instead, see scripts/fetch-music.mts.
import { mkdirSync, writeFileSync } from "node:fs";

const SR = 44100;
const SECONDS = Number(process.env.MUSIC_SECONDS ?? 90);
const SEED = Number(process.env.MUSIC_SEED ?? 0);
const hz = (midi: number) => 440 * 2 ** ((midi - 69) / 12);

type Drums = { kick: number[]; clap?: number[]; hats: number[]; level: number };
type Preset = {
  bpm: number;
  /** Chords as MIDI notes, one per `barsPerChord` bars, looping */
  chords: number[][];
  barsPerChord: number;
  pad: number;
  /** Pad brightness: how much of the upper partials to keep (0–1) */
  bright: number;
  bass: { pattern: [number, number, number][]; level: number } | null;
  /** Arpeggio steps per bar, the chord tone order, its octave and level */
  arp: { steps: number; order: number[]; octave: number; level: number; decay: number; tone: "pluck" | "bell" | "saw" } | null;
  /** Electric-piano chord stabs at these beats of each bar */
  keys: { beats: number[]; level: number } | null;
  drone: number;
  /** Duck pads and arp after each kick (the electronic "pump") */
  pump: number;
  drums: Drums | null;
  delay: number;
  reverb: number;
};

// Progressions in C; the seed transposes and rotates them
const POP = [[53, 57, 60, 64], [57, 60, 64, 67], [48, 55, 59, 64], [55, 57, 62, 67], [53, 57, 60, 64], [57, 60, 64, 67], [50, 57, 60, 65], [55, 59, 62, 67]];
const BRIGHT = [[48, 55, 60, 64], [55, 59, 62, 67], [57, 60, 64, 69], [53, 57, 60, 65]]; // I V vi IV
const MINOR = [[57, 60, 64, 67], [53, 57, 60, 64], [48, 55, 60, 64], [55, 59, 62, 67]]; // vi IV I V
const WIDE = [[50, 57, 62, 64, 69], [46, 53, 58, 62, 65], [53, 57, 60, 65, 67], [48, 55, 60, 62, 67]]; // Dm(add9) Bb F C

const PRESETS: Record<string, Preset> = {
  bed: {
    bpm: 92, chords: POP, barsPerChord: 1, pad: 0.05, bright: 0.6, drone: 0, pump: 0, delay: 0.22, reverb: 0.35,
    bass: { pattern: [[0, 1.9, 0.07], [2, 1.6, 0.045]], level: 1 },
    arp: { steps: 8, order: [0, 1, 2, 3, 2, 1, 2, 3], octave: 24, level: 0.085, decay: 5.5, tone: "pluck" },
    keys: null, drums: null,
  },
  upbeat: {
    bpm: 104, chords: POP, barsPerChord: 1, pad: 0.05, bright: 0.6, drone: 0, pump: 0, delay: 0.22, reverb: 0.35,
    bass: { pattern: [[0, 1.9, 0.07], [2, 1.6, 0.045]], level: 1 },
    arp: { steps: 8, order: [0, 1, 2, 3, 2, 1, 2, 3], octave: 24, level: 0.085, decay: 5.5, tone: "pluck" },
    keys: null, drums: { kick: [0, 4, 8, 12], hats: [2, 6, 10, 14], level: 1 },
  },
  editorial: {
    bpm: 88, chords: BRIGHT, barsPerChord: 1, pad: 0.03, bright: 1, drone: 0, pump: 0, delay: 0.16, reverb: 0.3,
    bass: { pattern: [[0, 1.4, 0.06], [2.5, 1.2, 0.04]], level: 1 },
    arp: { steps: 8, order: [3, 2, 1, 2, 3, 2, 1, 0], octave: 24, level: 0.05, decay: 7, tone: "bell" },
    keys: { beats: [0, 1.5, 2.5], level: 0.07 },
    drums: { kick: [0, 8], hats: [4, 12], level: 0.55 },
  },
  graphic: {
    bpm: 120, chords: MINOR, barsPerChord: 1, pad: 0.04, bright: 0.9, drone: 0, pump: 0.65, delay: 0.12, reverb: 0.2,
    bass: { pattern: [[0.5, 0.4, 0.07], [1.5, 0.4, 0.07], [2.5, 0.4, 0.07], [3.5, 0.4, 0.07]], level: 1 },
    arp: { steps: 16, order: [0, 2, 3, 2, 1, 3, 2, 3], octave: 24, level: 0.055, decay: 11, tone: "saw" },
    keys: null,
    drums: { kick: [0, 4, 8, 12], clap: [4, 12], hats: [2, 3, 6, 7, 10, 11, 14, 15], level: 1 },
  },
  cinematic: {
    bpm: 68, chords: WIDE, barsPerChord: 2, pad: 0.06, bright: 0.45, drone: 0.05, pump: 0, delay: 0.3, reverb: 0.6,
    bass: null,
    arp: { steps: 4, order: [4, 2, 3, 1], octave: 24, level: 0.045, decay: 2.2, tone: "bell" },
    keys: null, drums: null,
  },
};

function render(p: Preset, seed: number) {
  const n = Math.floor(SECONDS * SR);
  const L = new Float32Array(n);
  const R = new Float32Array(n);
  let s = 7 + seed * 7919;
  const rand = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
  const add = (i: number, l: number, r = l) => {
    if (i >= 0 && i < n) { L[i] += l; R[i] += r; }
  };
  const beat = 60 / p.bpm;
  const bar = beat * 4;
  // The seed shifts the key (-3..+4 semitones) and where in the progression it starts
  const transpose = seed === 0 ? 0 : [-3, -2, 2, 3, 4, -1, 1][seed % 7];
  const rotate = seed % p.chords.length;
  const chords = p.chords.map((_, i) => p.chords[(i + rotate) % p.chords.length].map((m) => m + transpose));
  const kickAt: number[] = [];

  const bars = Math.ceil(SECONDS / bar) + 1;
  for (let b = 0; b < bars; b++) {
    const chord = chords[Math.floor(b / p.barsPerChord) % chords.length];
    const t0 = b * bar;
    const firstOfChord = b % p.barsPerChord === 0;

    // Pad: detuned partial pairs per chord tone, slow attack, overlapping release
    if (firstOfChord)
      chord.forEach((note, k) => {
        const f = hz(note + 12);
        const len = bar * p.barsPerChord + 1.6;
        const start = Math.floor(t0 * SR);
        const pan = 0.25 + 0.5 * (k / (chord.length - 1));
        for (let j = 0; j < len * SR; j++) {
          const t = j / SR;
          const hold = bar * p.barsPerChord;
          const env = Math.min(1, t / (p.barsPerChord > 1 ? 2.2 : 0.9)) * (t > hold ? Math.max(0, 1 - (t - hold) / 1.6) : 1);
          const lfo = 1 + 0.08 * Math.sin(2 * Math.PI * 0.21 * (t0 + t) + k);
          const v = (Math.sin(2 * Math.PI * f * 0.9985 * t) + Math.sin(2 * Math.PI * f * 1.0015 * t) + p.bright * (0.35 * Math.sin(2 * Math.PI * f * 2 * t) + 0.15 * Math.sin(2 * Math.PI * f * 3.002 * t) + 0.08 * Math.sin(2 * Math.PI * f * 4.003 * t))) * env * lfo * p.pad;
          add(start + j, v * (1 - pan), v * pan);
        }
      });

    // Drone: the chord's root two octaves down, very slow swell (cinematic)
    if (p.drone && firstOfChord) {
      const f = hz(chord[0] - 12);
      const len = bar * p.barsPerChord + 2;
      const start = Math.floor(t0 * SR);
      for (let j = 0; j < len * SR; j++) {
        const t = j / SR;
        const env = Math.sin(Math.PI * Math.min(1, t / len)) ** 0.8;
        const v = (Math.sin(2 * Math.PI * f * t) + 0.3 * Math.sin(2 * Math.PI * f * 1.5 * t)) * env * p.drone;
        add(start + j, v);
      }
    }

    if (p.bass)
      for (const [at, len, vel] of p.bass.pattern) {
        const f = hz(chord[0] - 12);
        const start = Math.floor((t0 + at * beat) * SR);
        const l = len * beat;
        for (let j = 0; j < l * SR; j++) {
          const t = j / SR;
          const env = Math.min(1, t / 0.01) * Math.exp(-t * 1.6) * Math.min(1, (l - t) / 0.05);
          // A little second and third harmonic so laptops hear the bass line
          add(start + j, (Math.sin(2 * Math.PI * f * t) + 0.3 * Math.sin(2 * Math.PI * f * 2 * t) + 0.12 * Math.sin(2 * Math.PI * f * 3 * t)) * env * vel * p.bass.level);
        }
      }

    // Electric piano: chord stabs, sine plus a fading bell partial
    if (p.keys)
      for (const at of p.keys.beats) {
        const start = Math.floor((t0 + at * beat) * SR);
        chord.slice(0, 4).forEach((note, k) => {
          const f = hz(note + 12);
          for (let j = 0; j < 1.4 * SR; j++) {
            const t = j / SR;
            const env = Math.min(1, t / 0.005) * Math.exp(-t * 2.6);
            const v = (Math.sin(2 * Math.PI * f * t) + 0.5 * Math.sin(2 * Math.PI * f * 4 * t) * Math.exp(-t * 9) + 0.2 * Math.sin(2 * Math.PI * f * 2 * t)) * env * p.keys!.level * (0.9 + 0.2 * rand());
            add(start + j, v * (0.6 - k * 0.07), v * (0.4 + k * 0.07));
          }
        });
      }

    if (p.arp) {
      const a = p.arp;
      // The seed varies the arpeggio's order a little
      const order = a.order.map((o, i) => (seed && i % 3 === seed % 3 ? a.order[(i + 1) % a.order.length] : o));
      for (let e = 0; e < a.steps; e++) {
        const note = chord[order[e % order.length] % chord.length] + a.octave;
        const f = hz(note);
        const start = Math.floor((t0 + (e * bar) / a.steps) * SR);
        const vel = (e % 2 ? 0.8 : 1) * a.level * (0.85 + 0.3 * rand());
        const pan = e % 2 ? 0.7 : 0.3;
        for (let j = 0; j < 1.2 * SR; j++) {
          const t = j / SR;
          const env = Math.min(1, t / 0.004) * Math.exp(-t * a.decay);
          let v = Math.sin(2 * Math.PI * f * t);
          if (a.tone === "pluck") v += 0.45 * Math.sin(2 * Math.PI * f * 2 * t) * Math.exp(-t * 8) + 0.3 * Math.sin(2 * Math.PI * f * 3 * t) * Math.exp(-t * 12) + 0.15 * Math.sin(2 * Math.PI * f * 5 * t) * Math.exp(-t * 18);
          if (a.tone === "bell") v += 0.6 * Math.sin(2 * Math.PI * f * 2.76 * t) * Math.exp(-t * 6) + 0.3 * Math.sin(2 * Math.PI * f * 5.4 * t) * Math.exp(-t * 10);
          if (a.tone === "saw") for (let h = 2; h <= 7; h++) v += (Math.sin(2 * Math.PI * f * h * t) / h) * Math.exp(-t * (6 + h * 3));
          add(start + j, v * env * vel * (1 - pan), v * env * vel * pan);
        }
      }
    }

    if (p.drums) {
      const step = beat / 4;
      for (const k of p.drums.kick) {
        const start = Math.floor((t0 + k * step) * SR);
        kickAt.push(start);
        let phase = 0;
        for (let j = 0; j < 0.35 * SR; j++) {
          const t = j / SR;
          phase += (2 * Math.PI * (45 + 110 * Math.exp(-t * 28))) / SR;
          add(start + j, Math.sin(phase) * Math.exp(-t * 11) * 0.16 * p.drums.level);
        }
      }
      for (const c of p.drums.clap ?? []) {
        const start = Math.floor((t0 + c * step) * SR);
        let lp = 0;
        for (let j = 0; j < 0.18 * SR; j++) {
          const t = j / SR;
          const white = rand() * 2 - 1;
          lp += (white - lp) * 0.35;
          // Three quick bursts, then a tail: a clap
          const burst = t < 0.03 ? (Math.floor(t / 0.01) % 2 ? 0.6 : 1) : Math.exp(-(t - 0.03) * 22);
          add(start + j, (white - lp) * burst * 0.11 * p.drums.level * 0.9, (white - lp) * burst * 0.11 * p.drums.level);
        }
      }
      for (const h of p.drums.hats) {
        const start = Math.floor((t0 + h * step) * SR);
        let prev = 0;
        const accent = h % 4 === 2 ? 1 : 0.6;
        for (let j = 0; j < 0.05 * SR; j++) {
          const white = rand() * 2 - 1;
          const v = (white - prev) * Math.exp(-(j / SR) * 60) * 0.13 * accent * p.drums.level;
          prev = white;
          add(start + j, v * 0.8, v);
        }
      }
    }
  }

  // The pump: duck everything but the drums after each kick (approximated on the whole mix, then
  // the kicks are strong enough to stay on top)
  if (p.pump && kickAt.length) {
    const gain = new Float32Array(n).fill(1);
    const len = Math.floor(beat * 0.9 * SR);
    for (const k of kickAt)
      for (let j = 0; j < len && k + j < n; j++) gain[k + j] = Math.min(gain[k + j], 1 - p.pump * (1 - j / len) ** 2 * 0.6);
    for (let i = 0; i < n; i++) { L[i] *= gain[i]; R[i] *= gain[i]; }
  }

  // Ping-pong delay (dotted eighth), then a small Schroeder reverb
  const d = Math.floor(beat * 0.75 * SR);
  for (let i = d; i < n; i++) {
    L[i] += R[i - d] * p.delay;
    R[i] += L[i - d] * p.delay;
  }
  const reverb = (x: Float32Array, spread: number) => {
    const out = new Float32Array(n);
    for (const [ms, g] of [[29.7, 0.78], [37.1, 0.76], [41.1, 0.74], [43.7, 0.72]]) {
      const m = Math.floor(((ms + spread) / 1000) * SR);
      const buf = new Float32Array(n);
      for (let i = 0; i < n; i++) buf[i] = x[i] + (i >= m ? buf[i - m] * g : 0);
      for (let i = 0; i < n; i++) out[i] += buf[i] * 0.25;
    }
    for (const [ms, g] of [[5, 0.7], [1.7, 0.7]]) {
      const m = Math.floor((ms / 1000) * SR);
      const prev = out.slice();
      for (let i = 0; i < n; i++) out[i] = -g * prev[i] + (i >= m ? prev[i - m] + g * out[i - m] : 0);
    }
    return out;
  };
  const wl = reverb(L, 0);
  const wr = reverb(R, 1.3);
  // Level to a common average (about -16 dBFS RMS, so every preset sits at the same mix level),
  // with a soft limiter for the peaks
  let sum = 0;
  for (let i = 0; i < n; i++) {
    L[i] += wl[i] * p.reverb;
    R[i] += wr[i] * p.reverb;
    sum += L[i] * L[i] + R[i] * R[i];
  }
  const g = 10 ** (-16 / 20) / Math.sqrt(sum / (2 * n));
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const fade = Math.min(1, t / 2, (SECONDS - t) / 2);
    L[i] = Math.tanh(L[i] * g * 1.1) * 0.9 * fade;
    R[i] = Math.tanh(R[i] * g * 1.1) * 0.9 * fade;
  }
  return [L, R] as const;
}

function wav([L, R]: readonly [Float32Array, Float32Array]) {
  const n = L.length;
  const out = Buffer.alloc(44 + n * 4);
  out.write("RIFF", 0);
  out.writeUInt32LE(36 + n * 4, 4);
  out.write("WAVEfmt ", 8);
  out.writeUInt32LE(16, 16);
  out.writeUInt16LE(1, 20);
  out.writeUInt16LE(2, 22);
  out.writeUInt32LE(SR, 24);
  out.writeUInt32LE(SR * 4, 28);
  out.writeUInt16LE(4, 32);
  out.writeUInt16LE(16, 34);
  out.write("data", 36);
  out.writeUInt32LE(n * 4, 40);
  for (let i = 0; i < n; i++) {
    out.writeInt16LE(Math.round(Math.max(-1, Math.min(1, L[i])) * 32767), 44 + i * 4);
    out.writeInt16LE(Math.round(Math.max(-1, Math.min(1, R[i])) * 32767), 46 + i * 4);
  }
  return out;
}

mkdirSync("public/music", { recursive: true });
const wanted = process.argv.slice(2).filter((a) => !a.startsWith("-"));
for (const name of wanted.length ? wanted : Object.keys(PRESETS)) {
  const p = PRESETS[name];
  if (!p) throw new Error(`No music preset "${name}". Presets: ${Object.keys(PRESETS).join(", ")}`);
  writeFileSync(`public/music/${name}.wav`, wav(render(p, SEED)));
  const beat = 60 / p.bpm;
  writeFileSync(`public/music/${name}.beats.json`, JSON.stringify({ bpm: p.bpm, beat, bar: beat * 4, seconds: SECONDS, seed: SEED }, null, 2) + "\n");
  console.log(`public/music/${name}.wav: ${SECONDS} s, ${p.bpm} bpm${SEED ? `, seed ${SEED}` : ""}`);
}
