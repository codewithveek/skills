// Writes out/<video>.vtt for every video from its timeline, so captions follow any retiming.
// Run: npm run vtt
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";

type Cue = { from: number; to: number; text: string };
type Spec = { id: string; crossfade: number; scenes: { frames: number; cues: Cue[] }[] };
const FPS = 30;

const stamp = (frame: number) => {
  const ms = Math.round((frame / FPS) * 1000);
  const p = (n: number, w = 2) => String(n).padStart(w, "0");
  return `${p(Math.floor(ms / 3600000))}:${p(Math.floor(ms / 60000) % 60)}:${p(Math.floor(ms / 1000) % 60)}.${p(ms % 1000, 3)}`;
};

type Voice = { scenes: Record<string, { lines: { from: number; frames: number; text: string }[]; minFrames: number }> };

// Videos that open on their thumbnail (withPoster in src/kit/build.tsx) start 15 frames later.
// Read from Root.tsx so captions stay in step if the setting changes.
const root = readFileSync("src/Root.tsx", "utf8");
const opensOnThumbnail = (title: string) => /OPEN_ON_THUMBNAIL = true/.test(root) && root.includes(`"${title}Thumbnail"`);

const write = (v: Spec & { title?: string; scenes: { id?: string; frames: number; cues: Cue[] }[] }, voice?: Voice, offset = 0) => {
  let at = offset;
  // A music-led video (or one before `npm run voice`) has an empty manifest: its cues are the captions
  if (voice && Object.keys(voice.scenes).length === 0) voice = undefined;
  const cues = v.scenes.flatMap((s) => {
    const start = at;
    const scene = voice && s.id ? voice.scenes[s.id] : undefined;
    at += Math.max(s.frames, scene?.minFrames ?? 0) - v.crossfade;
    // With a voiceover, the captions are what is said, timed to each spoken line
    if (voice)
      return (scene?.lines ?? []).flatMap((l) => {
        // One cue per sentence, each given a share of the line's time by its length
        const sentences = l.text.split(/(?<=[.?!:])\s+(?=[A-Z0-9])/);
        const total = sentences.reduce((n, t) => n + t.length, 0);
        let t0 = start + l.from;
        return sentences.map((text, i) => {
          const from = t0;
          t0 += Math.round((l.frames * text.length) / total);
          return { from, to: i === sentences.length - 1 ? start + l.from + l.frames + 6 : t0, text };
        });
      });
    return s.cues.map((c) => ({ from: start + c.from, to: start + c.to, text: c.text }));
  });
  // A cue running into a crossfade would overlap the next scene's first cue; end it there
  for (let i = 0; i < cues.length - 1; i++) cues[i].to = Math.min(cues[i].to, cues[i + 1].from);
  const body = cues.map((c, i) => `${i + 1}\n${stamp(c.from)} --> ${stamp(c.to)}\n${c.text}`).join("\n\n");
  writeFileSync(`out/${v.id}.vtt`, `WEBVTT\n\n${body}\n`);
  console.log(`out/${v.id}.vtt: ${cues.length} cues`);
};

mkdirSync("out", { recursive: true });
for (const dir of readdirSync("src/videos", { withFileTypes: true })) {
  const file = `src/videos/${dir.name}/timeline.ts`;
  const voiceFile = `src/videos/${dir.name}/voice.json`;
  const voice = existsSync(voiceFile) ? (JSON.parse(readFileSync(voiceFile, "utf8")) as Voice) : undefined;
  if (dir.isDirectory() && existsSync(file)) {
    const { VIDEO } = await import(`../${file}`);
    write(VIDEO, voice, opensOnThumbnail(VIDEO.title) ? 15 : 0);
  }
}
