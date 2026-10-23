// Synthesises the kit's sound effects into public/sfx/, so they carry no licence:
//   mouse-click.wav  a crisp trackpad click (press and release), played by <Cursor clicks>
//   whoosh.wav       an airy swept whoosh moving left to right, played on each scene transition
//   pop.wav          a bubbly pop for something landing on screen, played by <Sfx name="pop">
// Run: npm run sfx. Replace a file to swap a sound; keep its timing (see scripts/audio/effects.mts).
import { mkdirSync } from "node:fs";
import { click, pop, whoosh } from "./audio/effects.mts";
import { writeWav } from "./audio/levels.mts";
import { seededRandom } from "./audio/synth.mts";

const random = seededRandom(23);
const EFFECTS = { "mouse-click": click, whoosh, pop } as const;

mkdirSync("public/sfx", { recursive: true });
for (const [name, make] of Object.entries(EFFECTS)) {
  const path = `public/sfx/${name}.wav`;
  writeWav({ path, bus: make(random) });
  console.log(path);
}
