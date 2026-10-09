// Downloads a real music track for one video, levels it to match the kit's presets, and records where
// it came from. Tracks are never committed to the kit (public/music/*.wav is git-ignored); each video
// project fetches its own.
//
//   npm run fetch-music -- <url of the audio file> --name launch --licence "CC0" \
//     --credit "Artist – Title" --source <page the track is listed on> [--bpm 100]
//
// Writes public/music/<name>.wav (44.1 kHz stereo, -14 LUFS like the presets), <name>.beats.json if
// --bpm is given, and a line in public/music/CREDITS.md. Point the video at it in Root.tsx:
// "music/<name>.wav". The licence is required: check it on the track's page before fetching, and
// read references/audio.md for which licences allow what.
// Behind an HTTPS proxy, run with NODE_USE_ENV_PROXY=1 (Node 22.21+), or download the file yourself
// and pass its path instead of a URL.
import { execFileSync } from "node:child_process";
import { appendFileSync, existsSync, mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const args = process.argv.slice(2);
const opt = (k: string) => {
  const i = args.indexOf(`--${k}`);
  return i >= 0 ? args[i + 1] : undefined;
};
const src = args.find((a, i) => !a.startsWith("--") && !(i > 0 && args[i - 1].startsWith("--")));
const name = opt("name");
const licence = opt("licence") ?? opt("license");
const credit = opt("credit");
const source = opt("source") ?? src;
const bpm = opt("bpm") ? Number(opt("bpm")) : undefined;

if (!src || !name || !licence || !credit) {
  console.error('Usage: npm run fetch-music -- <url or file> --name <name> --licence "<licence>" --credit "<artist – title>" [--source <page>] [--bpm <n>]');
  console.error("The licence and credit are required: they go into public/music/CREDITS.md.");
  process.exit(1);
}
if (!/^[a-z0-9-]+$/.test(name)) throw new Error("--name: lower-case letters, digits and dashes only");

let input = src;
if (/^https?:\/\//.test(src)) {
  const res = await fetch(src);
  if (!res.ok) throw new Error(`Download failed: ${res.status} ${res.statusText}`);
  input = join(mkdtempSync(join(tmpdir(), "music-")), "track");
  writeFileSync(input, Buffer.from(await res.arrayBuffer()));
} else if (!existsSync(src)) throw new Error(`No such file: ${src}`);

mkdirSync("public/music", { recursive: true });
const out = `public/music/${name}.wav`;
execFileSync("npx", ["remotion", "ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-i", input, "-vn", "-af", "loudnorm=I=-14:TP=-1.5:LRA=11", "-ar", "44100", "-ac", "2", "-c:a", "pcm_s16le", out], { stdio: "inherit" });
if (bpm) writeFileSync(`public/music/${name}.beats.json`, JSON.stringify({ bpm, beat: 60 / bpm, bar: 240 / bpm }, null, 2) + "\n");

const credits = "public/music/CREDITS.md";
if (!existsSync(credits)) writeFileSync(credits, "# Music used in these videos\n\n| File | Track | Licence | Source |\n|---|---|---|---|\n");
appendFileSync(credits, `| \`${name}.wav\` | ${credit} | ${licence} | ${source} |\n`);
console.log(`${out}: levelled to about -14 LUFS; credited in ${credits}`);
if (!/cc0|public domain/i.test(licence)) console.log(`Licence "${licence}": tell the user what it requires (attribution text, platforms, no redistribution) before delivering.`);
