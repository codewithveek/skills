/**
 * Runtime for fitted motion presets. Import this in any Remotion composition (Cutroom, the
 * product-videos skill) to play a preset back with the exact easing it was fitted with.
 */
import { Easing, interpolate, spring } from "remotion";

export type MotionChannel = "translateX" | "translateY" | "scale" | "progress";

export interface SpringEasing {
  readonly kind: "spring";
  readonly damping: number;
  readonly stiffness: number;
  readonly mass: number;
  readonly overshootClamping: boolean;
}

export interface BezierEasing {
  readonly kind: "bezier";
  readonly x1: number;
  readonly y1: number;
  readonly x2: number;
  readonly y2: number;
}

export type EasingSpec = SpringEasing | BezierEasing;

export interface MotionPreset {
  readonly id: string;
  readonly channel: MotionChannel;
  /** Duration measured in the reference video. */
  readonly durationMs: number;
  /** Total change: px for translate channels, percent for scale, unitless for progress. */
  readonly travel: number;
  readonly easing: EasingSpec;
}

export interface PresetProgressOptions {
  readonly frame: number;
  readonly fps: number;
  readonly preset: MotionPreset;
  /** Override the reference duration, e.g. to fit a beat into a storyboard slot. */
  readonly durationInFrames?: number;
}

export function presetDurationInFrames(preset: MotionPreset, fps: number): number {
  return Math.max(1, Math.round((preset.durationMs / 1000) * fps));
}

export function bezierProgress(easing: BezierEasing, linearTime: number): number {
  const clampedTime = Math.min(1, Math.max(0, linearTime));
  return Easing.bezier(easing.x1, easing.y1, easing.x2, easing.y2)(clampedTime);
}

export function springProgress(easing: SpringEasing, options: { frame: number; fps: number; durationInFrames: number }): number {
  return spring({
    frame: options.frame,
    fps: options.fps,
    durationInFrames: options.durationInFrames,
    config: {
      damping: easing.damping,
      stiffness: easing.stiffness,
      mass: easing.mass,
      overshootClamping: easing.overshootClamping,
    },
  });
}

/** 0 at the start of the beat, 1 at the end; may exceed 1 mid-way for overshooting springs. */
export function presetProgress(options: PresetProgressOptions): number {
  const durationInFrames = options.durationInFrames ?? presetDurationInFrames(options.preset, options.fps);
  const { easing } = options.preset;
  if (easing.kind === "spring") {
    return springProgress(easing, { frame: options.frame, fps: options.fps, durationInFrames });
  }
  return bezierProgress(easing, interpolate(options.frame, [0, durationInFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  }));
}

/** Channel value at a frame: px offset for translate, scale multiplier for scale, raw progress otherwise. */
export function presetValue(options: PresetProgressOptions): number {
  const progress = presetProgress(options);
  switch (options.preset.channel) {
    case "translateX":
    case "translateY":
      return progress * options.preset.travel;
    case "scale":
      return 1 + (progress * options.preset.travel) / 100;
    case "progress":
      return progress;
  }
}
