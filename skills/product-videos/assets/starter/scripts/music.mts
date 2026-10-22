// Synthesises the background music, so the videos carry no third-party licence:
//   public/music/upbeat.wav  vibrant minor-key pop-house, 128 BPM: punchy kick and sub, claps, syncopated
//                            hats and shaker, bright supersaw stabs, a bell arpeggio, risers and impacts
//                            every 16 bars. For launches (showcase, graphic, studio).
//   public/music/bed.wav     a calm modern beat, 100 BPM: soft drums, electric piano, sub, sparse bells.
//                            For tutorials and the editorial and cinematic looks.
// Mixed against measured professional launch tracks (references/audio.md), then normalised to the same
// loudness (−13 LUFS, true peak ≤ −1 dBTP) so the music levels in Root.tsx hold for either track.
// Options (env):
//   MUSIC_SECONDS (default 90): longer than the longest video; the mix fades it out at the end.
//   MUSIC_BPM (default 128): the upbeat track's tempo. Cut scenes on its bars (bar = 4 × 60 / BPM s).
//   MUSIC_STEMS=<dir>: also write each track's stems, unlevelled, for re-fitting the mix.
// Run: npm run music. Replace either file with a licensed track to swap the music.
import { mkdirSync } from "node:fs";
import { integratedLoudness, TRUE_PEAK_CEILING, writeWav, type WavLevel } from "./audio/levels.mts";
import type { Stereo } from "./audio/synth.mts";
import { describeLength, renderBed, renderUpbeat, type TrackOptions } from "./audio/tracks.mts";

const MUSIC_LEVEL: WavLevel = { kind: "loudness", lufs: -13, ceiling: TRUE_PEAK_CEILING };

const stemsDir = process.env.MUSIC_STEMS;
const stemWriter = (track: string): Pick<TrackOptions, "onStem"> =>
  stemsDir ? { onStem: (name: string, stem: Stereo) => void writeWav({ path: `${stemsDir}/${track}-${name}.wav`, bus: stem, level: { kind: "as-is" } }) } : {};

const writeTrack = (path: string, track: Stereo, bpm: number): void => {
  const gain = writeWav({ path, bus: track, level: MUSIC_LEVEL });
  const loudness = integratedLoudness({ left: track.left.map((value) => value * gain), right: track.right.map((value) => value * gain) });
  console.log(`${path.padEnd(24)} ${describeLength(track)} at ${bpm} BPM, ${loudness.toFixed(1)} LUFS`);
};

const length = Number(process.env.MUSIC_SECONDS ?? 90);
const upbeatBpm = Number(process.env.MUSIC_BPM ?? 128);
const BED_BPM = 100;
mkdirSync("public/music", { recursive: true });
if (stemsDir) mkdirSync(stemsDir, { recursive: true });

writeTrack("public/music/upbeat.wav", renderUpbeat({ seconds: length, bpm: upbeatBpm, seed: 7, ...stemWriter("upbeat") }), upbeatBpm);
writeTrack("public/music/bed.wav", renderBed({ seconds: length, bpm: BED_BPM, seed: 11, ...stemWriter("bed") }), BED_BPM);
