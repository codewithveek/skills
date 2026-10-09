// Synthesises the transition and motion sounds that no CC0 pack covers well, so they carry no
// third-party licence (like the music):
//   public/sfx/swish.wav   a quick airy swish (cards dealt, flips, push, swirls)        ~0.32 s
//   public/sfx/air.wav     a soft breath of air that swells and fades (focus pulls)      ~0.7 s
//   public/sfx/riser.wav   noise and a tone rising to a peak at the very end (circles)    ~0.9 s
//   public/sfx/thump.wav   a short low hit with some mid so laptops hear it (slabs, zoom) ~0.45 s
// The committed files were made with this script; run it again (npm run sfx) after changing it.
import { mkdirSync, writeFileSync } from "node:fs";

const SR = 48000;
let seed = 11;
const rand = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296) * 2 - 1;

/** A state-variable filter whose cutoff can change every sample. Returns [low, band] outputs. */
const svf = () => {
  let low = 0, band = 0;
  return (x: number, cutoff: number, q: number) => {
    const f = 2 * Math.sin((Math.PI * Math.min(cutoff, SR / 6)) / SR);
    low += f * band;
    const high = x - low - band / q;
    band += f * high;
    return [low, band] as const;
  };
};

const render = (seconds: number, sample: (t: number, i: number) => number) => {
  const n = Math.floor(seconds * SR);
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) out[i] = sample(i / SR, i);
  // Peak-normalise to -1 dBFS, with 4 ms fades so nothing clicks
  let peak = 0;
  for (const v of out) peak = Math.max(peak, Math.abs(v));
  const g = peak > 0 ? 10 ** (-1 / 20) / peak : 1;
  const fade = Math.floor(0.004 * SR);
  for (let i = 0; i < n; i++) out[i] *= g * Math.min(1, i / fade, (n - 1 - i) / fade);
  return out;
};

const lerpExp = (a: number, b: number, t: number) => a * (b / a) ** Math.min(1, Math.max(0, t));

const swish = () => {
  const f = svf();
  const D = 0.32;
  return render(D, (t) => {
    const p = t / D;
    const env = p < 0.35 ? (p / 0.35) ** 2 : (1 - (p - 0.35) / 0.65) ** 2.2;
    const cutoff = p < 0.4 ? lerpExp(500, 2400, p / 0.4) : lerpExp(2400, 900, (p - 0.4) / 0.6);
    return f(rand(), cutoff, 1.1)[1] * env;
  });
};

const air = () => {
  const f = svf();
  const D = 0.7;
  return render(D, (t) => {
    const p = t / D;
    const env = Math.sin(Math.PI * p) ** 1.6;
    const cutoff = p < 0.45 ? lerpExp(350, 2200, p / 0.45) : lerpExp(2200, 700, (p - 0.45) / 0.55);
    return f(rand(), cutoff, 0.8)[0] * env;
  });
};

const riser = () => {
  const f = svf();
  const D = 0.9;
  let phase = 0;
  return render(D, (t) => {
    const p = t / D;
    // Grows slowly then fast, and stops just after its peak (the circle has covered the frame)
    const env = p < 0.93 ? p ** 2.4 : Math.max(0, 1 - (p - 0.93) / 0.07) * 0.93 ** 2.4;
    const cutoff = lerpExp(250, 3000, p);
    phase += (2 * Math.PI * lerpExp(220, 880, p)) / SR;
    return (f(rand(), cutoff, 1.8)[1] * 0.7 + Math.sin(phase) * 0.3) * env;
  });
};

const thump = () => {
  const f = svf();
  const D = 0.45;
  let phase = 0;
  return render(D, (t) => {
    const body = Math.exp(-t / 0.11);
    phase += (2 * Math.PI * lerpExp(115, 46, t / 0.18)) / SR;
    const low = Math.sin(phase) * body;
    // The second harmonic, a short 330 Hz knock and a 12 ms filtered click give small speakers something to play
    const mid = Math.sin(phase * 2) * 0.28 * Math.exp(-t / 0.06) + Math.sin(2 * Math.PI * 330 * t) * 0.32 * Math.exp(-t / 0.035);
    const click = t < 0.012 ? f(rand(), 2200, 0.9)[0] * (1 - t / 0.012) * 0.9 : 0;
    return low + mid + click;
  });
};

const wav = (data: Float32Array) => {
  const n = data.length;
  const out = Buffer.alloc(44 + n * 2);
  out.write("RIFF", 0);
  out.writeUInt32LE(36 + n * 2, 4);
  out.write("WAVEfmt ", 8);
  out.writeUInt32LE(16, 16);
  out.writeUInt16LE(1, 20);
  out.writeUInt16LE(1, 22);
  out.writeUInt32LE(SR, 24);
  out.writeUInt32LE(SR * 2, 28);
  out.writeUInt16LE(2, 32);
  out.writeUInt16LE(16, 34);
  out.write("data", 36);
  out.writeUInt32LE(n * 2, 40);
  for (let i = 0; i < n; i++) out.writeInt16LE(Math.round(Math.max(-1, Math.min(1, data[i])) * 32767), 44 + i * 2);
  return out;
};

mkdirSync("public/sfx", { recursive: true });
for (const [name, make] of [["swish", swish], ["air", air], ["riser", riser], ["thump", thump]] as const) {
  const data = make();
  writeFileSync(`public/sfx/${name}.wav`, wav(data));
  console.log(`public/sfx/${name}.wav: ${(data.length / SR).toFixed(2)} s`);
}
