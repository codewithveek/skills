import { Easing, spring } from "remotion";
import { FPS } from "../../theme";

// Motion measured from real reference videos, as data. A preset is one beat of motion — how long it
// takes, how far it goes, and the exact easing curve — fitted to Remotion's own Easing.bezier or
// spring(), so it plays back the way it was measured. Presets come from the motion-lab tooling
// (assets/motion-lab); references/motion-data.md explains the numbers and when to use which.

export type MotionChannel = "translateX" | "translateY" | "scale" | "progress";

export type SpringEasing = {
  readonly kind: "spring";
  readonly damping: number;
  readonly stiffness: number;
  readonly mass: number;
  readonly overshootClamping: boolean;
};

export type BezierEasing = {
  readonly kind: "bezier";
  readonly x1: number;
  readonly y1: number;
  readonly x2: number;
  readonly y2: number;
};

export type EasingSpec = SpringEasing | BezierEasing;

export type MotionPreset = {
  readonly id: string;
  /** What moved in the reference: translate px, scale %, or timing only ("progress"). */
  readonly channel: MotionChannel;
  /** Measured duration. Converted to frames at the video's frame rate, so presets work at 30 or 60 fps. */
  readonly durationMs: number;
  /** Measured travel (px or %), for reference; components choose their own distances. */
  readonly travel: number;
  readonly easing: EasingSpec;
};

/** How many frames a preset lasts at `fps`. */
export const presetFrames = (preset: MotionPreset, fps: number = FPS): number =>
  Math.max(1, Math.round((preset.durationMs / 1000) * fps));

// A spring stretched to a fixed duration has one shape per damping ratio, so it is sampled once into
// a table and read back by linear time. 600 samples is finer than any frame rate needs.
const SPRING_SAMPLES = 600;
const SPRING_SAMPLE_FPS = 60;
const easingCache = new Map<string, (linearTime: number) => number>();

const springEasing = (easing: SpringEasing): ((linearTime: number) => number) => {
  const table = Array.from({ length: SPRING_SAMPLES + 1 }, (_, sample) =>
    spring({
      frame: sample,
      fps: SPRING_SAMPLE_FPS,
      durationInFrames: SPRING_SAMPLES,
      config: { damping: easing.damping, stiffness: easing.stiffness, mass: easing.mass, overshootClamping: easing.overshootClamping },
    }),
  );
  return (linearTime) => {
    const position = Math.min(1, Math.max(0, linearTime)) * SPRING_SAMPLES;
    const lower = Math.floor(position);
    const upper = Math.min(SPRING_SAMPLES, lower + 1);
    const lowerValue = table[lower] ?? 1;
    return lowerValue + ((table[upper] ?? lowerValue) - lowerValue) * (position - lower);
  };
};

/**
 * The preset's easing as a function of linear time (0 → 1). Plugs into the kit's helpers:
 * `progress(frame, from, to, easingOf(MOTION.screenPan.easing))`. May go past 1 (overshoot) or
 * below 0 (anticipation) mid-way; always ends at exactly 1.
 */
export const easingOf = (easing: EasingSpec): ((linearTime: number) => number) => {
  const key = JSON.stringify(easing);
  const cached = easingCache.get(key);
  if (cached) return cached;
  const created =
    easing.kind === "bezier"
      ? (() => {
          const curve = Easing.bezier(easing.x1, easing.y1, easing.x2, easing.y2);
          return (linearTime: number) => curve(Math.min(1, Math.max(0, linearTime)));
        })()
      : springEasing(easing);
  easingCache.set(key, created);
  return created;
};

export type MeasuredOptions = {
  /** Stretch or squeeze the beat to this many frames (the curve shape is kept). Defaults to the measured length. */
  readonly frames?: number;
  readonly fps?: number;
};

/**
 * A measured beat starting at `at`: 0 before it, 1 after it, and the reference's exact curve in
 * between. `measured(frame, 30, MOTION.screenPan)` → multiply by your own distance.
 */
export const measured = (frame: number, at: number, preset: MotionPreset, options: MeasuredOptions = {}): number => {
  const frames = options.frames ?? presetFrames(preset, options.fps ?? FPS);
  return easingOf(preset.easing)((frame - at) / frames);
};
