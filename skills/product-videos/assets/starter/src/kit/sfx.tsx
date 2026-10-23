import React from "react";
import { Audio, Sequence, staticFile } from "remotion";

/** The kit's generated sound effects (public/sfx, npm run sfx). */
export type SfxName = "mouse-click" | "whoosh" | "pop";

/** Default levels, set against the music's level when nobody speaks (build.tsx). */
export const SFX_VOLUME: Readonly<Record<SfxName, number>> = { "mouse-click": 0.38, whoosh: 0.2, pop: 0.3 };

/** Frames each effect needs to play out at 30 fps. */
const SFX_FRAMES: Readonly<Record<SfxName, number>> = { "mouse-click": 6, whoosh: 20, pop: 8 };

export type SfxProps = {
  name: SfxName;
  /** Frame (in the scene) where the sound starts. The pop and click peak within 5 ms, so put them on the landing frame. */
  at: number;
  volume?: number;
};

/**
 * One sound effect at a frame. Use sparingly: a pop on the one element a scene is about (a badge, the
 * number, the word that lands), not on every chip. Cursor clicks and transition whooshes are automatic.
 */
export const Sfx = ({ name, at, volume = SFX_VOLUME[name] }: SfxProps) => (
  <Sequence from={Math.max(0, at)} durationInFrames={SFX_FRAMES[name]} layout="none">
    <Audio src={staticFile(`sfx/${name}.wav`)} volume={volume} />
  </Sequence>
);
