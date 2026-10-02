// Synthesises the background music, so the videos carry no third-party licence:
//   public/music/bed.wav     calm bed for the tutorials (pads, plucked arpeggio, bass, reverb)
//   public/music/upbeat.wav  the same harmony with a kick and hats, for launches and cutdowns
// Length: MUSIC_SECONDS (default 90). Longer than the longest video; the mix fades it out at the end.
// Run: npm run music. Replace either file with a licensed track to swap the music.
import { mkdirSync, writeFileSync } from "node:fs";

const SR = 44100;

function render(opts: { seconds: number; bpm: number; drums: boolean; seed: number }) {
  const n = Math.floor(opts.seconds * SR);
  const L = new Float32Array(n);
  const R = new Float32Array(n);
  const beat = 60 / opts.bpm;
  const bar = beat * 4;
  let seed = opts.seed;
  const rand = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
  const hz = (midi: number) => 440 * 2 ** ((midi - 69) / 12);

  // Fmaj7, Am7, Cmaj7, Gsus2, Fmaj7, Am7, Dm7, G — one bar each, looping
  const CHORDS = [
    [53, 57, 60, 64],
    [57, 60, 64, 67],
    [48, 55, 59, 64],
    [55, 57, 62, 67],
    [53, 57, 60, 64],
    [57, 60, 64, 67],
    [50, 57, 60, 65],
    [55, 59, 62, 67],
  ];
  const add = (buf: Float32Array, i: number, v: number) => {
    if (i >= 0 && i < n) buf[i] += v;
  };

  const bars = Math.ceil(opts.seconds / bar) + 1;
  for (let b = 0; b < bars; b++) {
    const chord = CHORDS[b % CHORDS.length];
    const t0 = b * bar;

    // Pad: each chord tone as a detuned pair of soft partials, slow attack, overlapping release
    for (const [k, note] of chord.entries()) {
      const f = hz(note + 12);
      const len = bar + 1.4;
      const start = Math.floor(t0 * SR);
      const pan = 0.3 + 0.4 * (k / 3);
      for (let j = 0; j < len * SR; j++) {
        const t = j / SR;
        const env = Math.min(1, t / 0.9) * (t > bar ? Math.max(0, 1 - (t - bar) / 1.4) : 1);
        const lfo = 1 + 0.08 * Math.sin(2 * Math.PI * 0.21 * (t0 + t) + k);
        const v =
          (Math.sin(2 * Math.PI * f * 0.9985 * t) +
            Math.sin(2 * Math.PI * f * 1.0015 * t) +
            0.35 * Math.sin(2 * Math.PI * f * 2 * t) +
            0.12 * Math.sin(2 * Math.PI * f * 4.003 * t) +
            0.06 * Math.sin(2 * Math.PI * f * 6.01 * t)) *
          env * lfo * 0.05;
        add(L, start + j, v * (1 - pan));
        add(R, start + j, v * pan);
      }
    }

    // Bass: the root, held for half a bar, then a softer repeat
    for (const [offset, len, vel] of [
      [0, beat * 1.9, 0.07],
      [beat * 2, beat * 1.6, 0.045],
    ] as const) {
      const f = hz(chord[0] - 12);
      const start = Math.floor((t0 + offset) * SR);
      for (let j = 0; j < len * SR; j++) {
        const t = j / SR;
        const env = Math.min(1, t / 0.02) * Math.exp(-t * 1.2) * Math.min(1, (len - t) / 0.08);
        const v = (Math.sin(2 * Math.PI * f * t) + 0.25 * Math.sin(2 * Math.PI * f * 2 * t)) * env * vel;
        add(L, start + j, v);
        add(R, start + j, v);
      }
    }

    // Plucked arpeggio in eighths, rising then falling through the chord
    const order = [0, 1, 2, 3, 2, 1, 2, 3];
    for (let e = 0; e < 8; e++) {
      const note = chord[order[e]] + 24;
      const f = hz(note);
      const start = Math.floor((t0 + e * beat * 0.5) * SR);
      const vel = (e % 2 ? 0.07 : 0.095) * (0.85 + 0.3 * rand());
      const pan = e % 2 ? 0.7 : 0.3;
      for (let j = 0; j < 1.2 * SR; j++) {
        const t = j / SR;
        const env = Math.min(1, t / 0.004) * Math.exp(-t * 5.5);
        const v =
          (Math.sin(2 * Math.PI * f * t) +
            0.45 * Math.sin(2 * Math.PI * f * 2 * t) * Math.exp(-t * 8) +
            0.3 * Math.sin(2 * Math.PI * f * 3 * t) * Math.exp(-t * 12) +
            0.15 * Math.sin(2 * Math.PI * f * 5 * t) * Math.exp(-t * 18)) *
          env * vel;
        add(L, start + j, v * (1 - pan));
        add(R, start + j, v * pan);
      }
    }

    if (opts.drums) {
      for (let q = 0; q < 4; q++) {
        // Kick on every beat: a falling sine
        const start = Math.floor((t0 + q * beat) * SR);
        let phase = 0;
        for (let j = 0; j < 0.35 * SR; j++) {
          const t = j / SR;
          const f = 45 + 110 * Math.exp(-t * 28);
          phase += (2 * Math.PI * f) / SR;
          const v = Math.sin(phase) * Math.exp(-t * 11) * 0.16;
          add(L, start + j, v);
          add(R, start + j, v);
        }
        // Hats on the offbeats: short, bright noise
        const hat = Math.floor((t0 + q * beat + beat / 2) * SR);
        let prev = 0;
        for (let j = 0; j < 0.06 * SR; j++) {
          const white = rand() * 2 - 1;
          const bright = white - prev;
          prev = white;
          const v = bright * Math.exp(-(j / SR) * 55) * 0.16;
          add(L, hat + j, v * 0.8);
          add(R, hat + j, v);
        }
      }
    }
  }

  // Ping-pong delay on the whole mix (dotted eighth), then a small Schroeder reverb
  const d = Math.floor(beat * 0.75 * SR);
  for (let i = d; i < n; i++) {
    L[i] += R[i - d] * 0.22;
    R[i] += L[i - d] * 0.22;
  }
  const reverb = (x: Float32Array, spread: number) => {
    const out = new Float32Array(n);
    for (const [ms, g] of [
      [29.7, 0.78],
      [37.1, 0.76],
      [41.1, 0.74],
      [43.7, 0.72],
    ]) {
      const m = Math.floor(((ms + spread) / 1000) * SR);
      const buf = new Float32Array(n);
      for (let i = 0; i < n; i++) buf[i] = x[i] + (i >= m ? buf[i - m] * g : 0);
      for (let i = 0; i < n; i++) out[i] += buf[i] * 0.25;
    }
    for (const [ms, g] of [
      [5, 0.7],
      [1.7, 0.7],
    ]) {
      const m = Math.floor((ms / 1000) * SR);
      const prev = out.slice();
      for (let i = 0; i < n; i++) out[i] = -g * prev[i] + (i >= m ? prev[i - m] + g * out[i - m] : 0);
    }
    return out;
  };
  const wl = reverb(L, 0);
  const wr = reverb(R, 1.3);
  let peak = 0;
  for (let i = 0; i < n; i++) {
    L[i] = Math.tanh((L[i] + wl[i] * 0.35) * 1.2);
    R[i] = Math.tanh((R[i] + wr[i] * 0.35) * 1.2);
    peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]));
  }
  // Fade the first and last two seconds, normalise to -1 dBFS
  const gain = 0.89 / peak;
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const fade = Math.min(1, t / 2, (opts.seconds - t) / 2);
    L[i] *= gain * fade;
    R[i] *= gain * fade;
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
const SECONDS = Number(process.env.MUSIC_SECONDS ?? 90);
writeFileSync("public/music/bed.wav", wav(render({ seconds: SECONDS, bpm: 92, drums: false, seed: 7 })));
console.log(`public/music/bed.wav: ${SECONDS} s, 92 bpm`);
writeFileSync("public/music/upbeat.wav", wav(render({ seconds: SECONDS, bpm: 104, drums: true, seed: 11 })));
console.log(`public/music/upbeat.wav: ${SECONDS} s, 104 bpm`);
