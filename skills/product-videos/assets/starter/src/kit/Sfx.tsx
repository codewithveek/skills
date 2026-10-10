import React from "react";
import { Audio, Sequence, staticFile } from "remotion";
import { useLook } from "./looks";

// The sound effects in public/sfx/, each with its length and a default level. Sources and licences
// are in public/sfx/CREDITS.md: Kenney's CC0 packs, the kit's own synth (npm run sfx), and two CC0
// files from the first kit. Levels are set against music at 0.5 and a voice at full volume.
export const SFX = {
  click: { file: "mouse-click.wav", frames: 12, volume: 0.38 }, // the cursor
  whoosh: { file: "whoosh.wav", frames: 5, volume: 0.2 }, // crossfades
  air: { file: "air.wav", frames: 21, volume: 0.32 }, // focus pulls
  swish: { file: "swish.wav", frames: 10, volume: 0.3 }, // dealt cards, flips, push, swirls
  riser: { file: "riser.wav", frames: 27, volume: 0.3 }, // circle reveals: peaks as the circle covers the frame
  thump: { file: "thump.wav", frames: 14, volume: 0.3 }, // colour slabs, zoom-through
  open: { file: "open.wav", frames: 6, volume: 0.16 }, // a panel growing open
  tick: { file: "tick.wav", frames: 1, volume: 0.22 }, // odometer steps, word-slot steps
  pop: { file: "pop.wav", frames: 6, volume: 0.2 }, // something small appearing
  land: { file: "land.wav", frames: 8, volume: 0.3 }, // a card landing on the table
  stamp: { file: "stamp.wav", frames: 8, volume: 0.42 }, // a stamp slamming down
  confirm: { file: "confirm.wav", frames: 9, volume: 0.24 }, // a resolved, good state: Ready, Passed, Saved
  alert: { file: "alert.wav", frames: 3, volume: 0.2 }, // a limit hit, a red state
  glitch: { file: "glitch.wav", frames: 1, volume: 0.18 }, // pixels appearing or collapsing
  blip: { file: "blip.wav", frames: 10, volume: 0.16 }, // a graphic accent, a name landing
  switch: { file: "switch.wav", frames: 2, volume: 0.45 }, // a light switching on (the dark-room hook)
  // Keyboard keys, four variations so typing doesn't sound like one sample repeated; Typewriter picks them
  key1: { file: "key1.wav", frames: 1, volume: 0.16 },
  key2: { file: "key2.wav", frames: 1, volume: 0.16 },
  key3: { file: "key3.wav", frames: 2, volume: 0.16 },
  key4: { file: "key4.wav", frames: 2, volume: 0.16 },
} as const;

export type SfxName = keyof typeof SFX;

/**
 * Plays one effect at frame `at` of the current scene, in the current look's sound palette: the look
 * may swap it for another (Graphic swaps `land` for `pop`), turn it off (Cinematic drops ticks) and
 * scale every level. `endAt` aligns the effect's end instead (a riser that peaks on a cut).
 */
export const Sfx = ({ name, at, endAt, volume = 1 }: { name: SfxName; at?: number; endAt?: number; volume?: number }) => {
  const look = useLook();
  const resolved = name in look.sfx.swap ? look.sfx.swap[name] : name;
  if (!resolved || look.sfx.level === 0) return null;
  const s = SFX[resolved];
  const from = endAt !== undefined ? endAt - s.frames : (at ?? 0);
  return (
    <Sequence from={Math.round(from)} durationInFrames={s.frames + 30} layout="none">
      <Audio src={staticFile(`sfx/${s.file}`)} volume={s.volume * volume * look.sfx.level} />
    </Sequence>
  );
};
