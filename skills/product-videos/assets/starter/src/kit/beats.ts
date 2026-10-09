import { FPS } from "../theme";

// Cutting on the beat. The music presets have fixed tempos (scripts/music.mts writes each one's
// <preset>.beats.json); a fetched track's tempo is whatever its source says. Scenes and hits placed
// on beats feel deliberate; the Graphic look in particular cuts on the bar.

export const BPM = { bed: 92, upbeat: 104, editorial: 88, graphic: 120, cinematic: 68 } as const;

/** Frames in `n` beats at `bpm` (rounded to whole frames). */
export const beats = (n: number, bpm: number) => Math.round((n * 60 * FPS) / bpm);

/** Frames in `n` bars of four beats: use for scene lengths so cuts land on the downbeat. */
export const bars = (n: number, bpm: number) => beats(n * 4, bpm);

/**
 * The nearest beat to a frame of the video, for snapping a hit (a stamp, a slab, a name landing)
 * onto the music. `every` is in beats: 1 for any beat, 2 for every other, 4 for bar lines.
 */
export const onBeat = (frame: number, bpm: number, every = 1) => {
  const step = (every * 60 * FPS) / bpm;
  return Math.round(Math.round(frame / step) * step);
};
