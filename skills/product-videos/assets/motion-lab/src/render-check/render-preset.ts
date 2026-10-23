/**
 * Render a motion preset with Remotion at 60 fps, plus a `.truth.json` holding the exact progress
 * curve that was played (used for calibration).
 *
 *   # replay a fitted beat with its best easing (or force linear as a control)
 *   npm run render-check -- --fitted data/saas-launch/presets/fitted-beats.json --beat-id 94 --easing best --out renders/beat-94.mp4
 *   # render an arbitrary preset (calibration)
 *   npm run render-check -- --preset '{"id":"cal","channel":"translateX","durationMs":700,"travel":-600,"easing":{...}}' --out renders/cal.mp4
 */
import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import type { EasingSpec, MotionPreset } from "../runtime/motion-preset";
import { presetDurationInFrames, presetProgress } from "../runtime/motion-preset";
import { NAMED_EASINGS } from "../presets/fit-bezier";
import type { FittedBeat } from "../presets/types";
import type { PresetReplayProps } from "./preset-replay";
import { REPLAY_COMPOSITION_ID, REPLAY_FPS } from "./root";

const HOLD_FRAMES = 12;
/** Use an installed browser instead of Remotion's download (offline or locked-down machines). */
const BROWSER_CANDIDATES = [process.env["REMOTION_BROWSER_EXECUTABLE"]] as const;
const LINEAR: EasingSpec = { kind: "bezier", x1: 0, y1: 0, x2: 1, y2: 1 };

function resolveBrowserExecutable(): string | null {
  return BROWSER_CANDIDATES.find((candidate): candidate is string => typeof candidate === "string" && existsSync(candidate)) ?? null;
}

function pickEasing(beat: FittedBeat, choice: string): EasingSpec {
  if (choice === "best") return beat.best.easing;
  if (choice === "spring") return beat.springFit.easing;
  if (choice === "bezier") return beat.bezierFit.easing;
  if (choice === "linear") return LINEAR;
  if (choice.startsWith("named:")) {
    const named = NAMED_EASINGS.find((candidate) => candidate.name === choice.slice("named:".length));
    if (named) return named.easing;
  }
  throw new Error(`Unknown --easing "${choice}" (best | spring | bezier | linear | named:<name>)`);
}

async function presetFromFittedBeat(options: { fittedPath: string; beatId: number; easingChoice: string }): Promise<MotionPreset> {
  const fitted = JSON.parse(await readFile(options.fittedPath, "utf8")) as FittedBeat[];
  const beat = fitted.find((candidate) => candidate.beatId === options.beatId);
  if (!beat) throw new Error(`Beat ${options.beatId} not found in ${options.fittedPath}`);
  return {
    id: `beat-${beat.beatId}-${options.easingChoice}`,
    channel: beat.channel,
    durationMs: beat.durationMs,
    travel: beat.travel,
    easing: pickEasing(beat, options.easingChoice),
  };
}

async function renderPreset(options: { preset: MotionPreset; outPath: string }): Promise<void> {
  const entryPoint = resolve(dirname(fileURLToPath(import.meta.url)), "index.ts");
  const serveUrl = await bundle({ entryPoint });
  const inputProps: PresetReplayProps = { preset: options.preset, holdBeforeFrames: HOLD_FRAMES, holdAfterFrames: HOLD_FRAMES };
  const browserExecutable = resolveBrowserExecutable();
  const composition = await selectComposition({ serveUrl, id: REPLAY_COMPOSITION_ID, inputProps, browserExecutable });
  await mkdir(dirname(options.outPath), { recursive: true });
  await renderMedia({
    composition,
    serveUrl,
    codec: "h264",
    crf: 10,
    outputLocation: options.outPath,
    inputProps,
    browserExecutable,
    logLevel: "warn",
  });
  const durationInFrames = presetDurationInFrames(options.preset, REPLAY_FPS);
  const truth = {
    preset: options.preset,
    fps: REPLAY_FPS,
    beatStartFrame: HOLD_FRAMES,
    durationInFrames,
    progress: Array.from({ length: durationInFrames + 1 }, (_, frame) => presetProgress({ frame, fps: REPLAY_FPS, preset: options.preset })),
  };
  await writeFile(options.outPath.replace(/\.mp4$/, ".truth.json"), JSON.stringify(truth, null, 1));
}

async function main(): Promise<void> {
  const { values } = parseArgs({
    options: {
      fitted: { type: "string" },
      "beat-id": { type: "string" },
      easing: { type: "string", default: "best" },
      preset: { type: "string" },
      out: { type: "string" },
    },
  });
  if (!values.out) throw new Error("--out is required");
  const preset = values.preset
    ? (JSON.parse(values.preset) as MotionPreset)
    : await presetFromFittedBeat({
        fittedPath: values.fitted ?? "data/saas-launch/presets/fitted-beats.json",
        beatId: Number(values["beat-id"]),
        easingChoice: values.easing ?? "best",
      });
  const startedAt = performance.now();
  await renderPreset({ preset, outPath: values.out });
  console.log(`rendered ${preset.id} (${preset.channel}, ${preset.durationMs} ms, ${JSON.stringify(preset.easing)}) -> ${values.out} in ${((performance.now() - startedAt) / 1000).toFixed(1)}s`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.stack ?? error.message : error);
  process.exitCode = 1;
});
