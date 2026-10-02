// Generates the voiceover with Kokoro (local, Apache-2.0) from each video's narration.ts.
// Needs kokoro-js once: npm i -D kokoro-js@1  (about 500 MB of ONNX runtime; the model, ~90 MB, downloads on first run).
// Voice: KOKORO_VOICE (default af_heart, the best-graded). Speed: KOKORO_SPEED (default 1).
// Writes public/vo/<video>/<scene>-<n>.wav and src/videos/<video>/voice.json (where each
// line lands, and how long each scene must be to fit it). Unchanged lines are reused.
// Run: npm run voice   (first run downloads the ~90 MB model)
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";

const FPS = 30;
const VOICE = process.env.KOKORO_VOICE ?? "af_heart";
const SPEED = Number(process.env.KOKORO_SPEED ?? 1);
const GAP = 6; // frames between two lines of the same scene
const TAIL = 14; // frames after the last line before the scene may end
const CROSSFADE = 12; // a scene's last frames are under the next one's fade

type Line = { at: number; text: string; say?: string };

/** Copies a 32-bit float WAV, scaled so its peak sits at -1 dBFS: every line at the same level. */
function copyNormalised(from: string, to: string) {
  const b = readFileSync(from);
  let off = 12;
  while (b.toString("ascii", off, off + 4) !== "data") off += 8 + b.readUInt32LE(off + 4);
  const n = b.readUInt32LE(off + 4) / 4;
  let peak = 0;
  for (let i = 0; i < n; i++) peak = Math.max(peak, Math.abs(b.readFloatLE(off + 8 + i * 4)));
  const gain = peak > 0 ? 0.891 / peak : 1;
  for (let i = 0; i < n; i++) b.writeFloatLE(b.readFloatLE(off + 8 + i * 4) * gain, off + 8 + i * 4);
  writeFileSync(to, b);
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let tts: any = null;
const cacheDir = "public/vo/cache";
mkdirSync(cacheDir, { recursive: true });

async function speak(text: string): Promise<{ file: string; seconds: number }> {
  const key = createHash("sha256").update(`${VOICE}|${SPEED}|${text}`).digest("hex").slice(0, 16);
  const file = `${cacheDir}/${key}.wav`;
  const meta = `${file}.json`;
  if (existsSync(file) && existsSync(meta)) return { file, seconds: JSON.parse(readFileSync(meta, "utf8")).seconds };
  if (!tts) {
    const kokoro = await import("kokoro-js").catch(() => {
      console.error("kokoro-js is not installed. Run: npm i -D kokoro-js@1");
      process.exit(1);
    });
    tts = await kokoro.KokoroTTS.from_pretrained("onnx-community/Kokoro-82M-v1.0-ONNX", { dtype: "q8", device: "cpu" });
  }
  const audio = await tts.generate(text, { voice: VOICE, speed: SPEED });
  await audio.save(file);
  const seconds = audio.audio.length / audio.sampling_rate;
  writeFileSync(meta, JSON.stringify({ seconds, text }));
  return { file, seconds };
}

for (const dir of readdirSync("src/videos", { withFileTypes: true })) {
  const narrationFile = `src/videos/${dir.name}/narration.ts`;
  if (!dir.isDirectory() || !existsSync(narrationFile)) continue;
  const { NARRATION } = (await import(`../${narrationFile}`)) as { NARRATION: Record<string, Line[]> };
  const { VIDEO } = await import(`../src/videos/${dir.name}/timeline.ts`);
  mkdirSync(`public/vo/${dir.name}`, { recursive: true });
  const scenes: Record<string, { lines: { src: string; from: number; frames: number; text: string }[]; minFrames: number }> = {};
  for (const scene of VIDEO.scenes as { id: string; frames: number }[]) {
    const lines = NARRATION[scene.id] ?? [];
    let cursor = 0;
    const placed = [];
    for (const [i, line] of lines.entries()) {
      const { file, seconds } = await speak(line.say ?? line.text);
      const src = `vo/${dir.name}/${scene.id}-${i + 1}.wav`;
      copyNormalised(file, `public/${src}`);
      const from = Math.max(line.at, cursor);
      const frames = Math.ceil(seconds * FPS);
      placed.push({ src, from, frames, text: line.text });
      cursor = from + frames + GAP;
    }
    const end = placed.length ? placed[placed.length - 1].from + placed[placed.length - 1].frames : 0;
    const minFrames = Math.max(scene.frames, end + TAIL + CROSSFADE);
    scenes[scene.id] = { lines: placed, minFrames };
    const grew = minFrames - scene.frames;
    console.log(`${dir.name}/${scene.id}: ${placed.length} line(s), ends ${end}/${scene.frames}${grew > 0 ? `, scene grows by ${grew} frames` : ""}`);
  }
  writeFileSync(`src/videos/${dir.name}/voice.json`, JSON.stringify({ voice: VOICE, scenes }, null, 2) + "\n");
}
