// Checks audio you cannot listen to. For a WAV or a rendered MP4, prints peak and average level,
// how energy splits across the spectrum, and a timeline of loudness (one character per 0.1 s).
//   node scripts/audio-report.mjs out/example.mp4 public/music/bed.wav public/vo/example/demo-1.wav
// Reads 16-bit PCM and 32-bit float WAVs (Kokoro writes float); MP4s are decoded with Remotion's ffmpeg.
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const fft = (re, im) => {
  const n = re.length;
  for (let i = 1, j = 0; i < n; i++) {
    let b = n >> 1;
    for (; j & b; b >>= 1) j ^= b;
    j ^= b;
    if (i < j) [re[i], re[j], im[i], im[j]] = [re[j], re[i], im[j], im[i]];
  }
  for (let len = 2; len <= n; len <<= 1) {
    const a = (-2 * Math.PI) / len;
    for (let i = 0; i < n; i += len)
      for (let k = 0; k < len / 2; k++) {
        const c = Math.cos(a * k), s = Math.sin(a * k), p = i + k + len / 2;
        const xr = re[p] * c - im[p] * s, xi = re[p] * s + im[p] * c;
        re[p] = re[i + k] - xr; im[p] = im[i + k] - xi; re[i + k] += xr; im[i + k] += xi;
      }
  }
};

function readWav(file) {
  const b = readFileSync(file);
  let off = 12;
  while (b.toString("ascii", off, off + 4) !== "data") off += 8 + b.readUInt32LE(off + 4);
  const fmt = b.readUInt16LE(20), ch = b.readUInt16LE(22), sr = b.readUInt32LE(24), by = b.readUInt16LE(34) / 8;
  const n = Math.floor(b.readUInt32LE(off + 4) / (by * ch));
  const x = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    let v = 0;
    for (let c = 0; c < ch; c++) {
      const o = off + 8 + (i * ch + c) * by;
      v += fmt === 3 ? b.readFloatLE(o) : b.readInt16LE(o) / 32768;
    }
    x[i] = v / ch;
  }
  return { x, sr };
}

for (const file of process.argv.slice(2)) {
  let wav = file;
  if (!file.endsWith(".wav")) {
    wav = join(mkdtempSync(join(tmpdir(), "audio-")), "a.wav");
    execFileSync("npx", ["remotion", "ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-i", file, "-vn", "-acodec", "pcm_s16le", "-ac", "1", wav]);
  }
  const { x, sr } = readWav(wav);
  let peak = 0, sq = 0;
  for (const v of x) { peak = Math.max(peak, Math.abs(v)); sq += v * v; }
  const N = 2048, spec = new Float64Array(N / 2);
  for (let s = 0; s + N <= x.length; s += N) {
    const re = new Float64Array(N), im = new Float64Array(N);
    for (let i = 0; i < N; i++) re[i] = x[s + i] * (0.5 - 0.5 * Math.cos((2 * Math.PI * i) / N));
    fft(re, im);
    for (let k = 1; k < N / 2; k++) spec[k] += re[k] ** 2 + im[k] ** 2;
  }
  const tot = spec.reduce((a, v) => a + v, 0) || 1;
  const band = (a, z) => { let e = 0; for (let k = 1; k < N / 2; k++) { const f = (k * sr) / N; if (f >= a && f < z) e += spec[k]; } return ((100 * e) / tot).toFixed(0) + "%"; };
  console.log(`${file}: ${(x.length / sr).toFixed(1)} s, peak ${(20 * Math.log10(peak || 1e-9)).toFixed(1)} dBFS, RMS ${(10 * Math.log10(sq / x.length || 1e-12)).toFixed(1)} dBFS`);
  console.log(`  spectrum: <250 Hz ${band(0, 250)}, 250-1k ${band(250, 1000)}, 1-4k ${band(1000, 4000)}, >4k ${band(4000, sr / 2)}`);
  const win = Math.floor(sr / 10);
  let line = "";
  for (let s = 0, k = 0; s + win <= x.length; s += win, k++) {
    let q = 0;
    for (let i = s; i < s + win; i++) q += x[i] * x[i];
    const db = 10 * Math.log10(q / win + 1e-12);
    line += db > -24 ? "#" : db > -34 ? "+" : db > -50 ? "." : " ";
    if (k % 50 === 49 || s + 2 * win > x.length) { console.log(`  ${String(Math.floor(k / 50) * 5).padStart(3)}s |${line}|`); line = ""; }
  }
}
console.log("legend: # voice-level  + music or effects  . quiet  (blank) silent; each character is 0.1 s");
