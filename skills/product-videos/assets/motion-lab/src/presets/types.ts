import type { BezierEasing, EasingSpec, MotionChannel, SpringEasing } from "../runtime/motion-preset";

/** Mirrors analysis/motion_curves.py BeatCurve.to_json(). */
export type AnalysisChannel = "translate_x" | "translate_y" | "scale" | "speed";

export interface BeatCurve {
  readonly beat_id: number;
  readonly scene: string;
  readonly start_frame: number;
  readonly end_frame: number;
  readonly duration_frames: number;
  readonly channel: AnalysisChannel;
  readonly unit: string;
  readonly travel: number;
  readonly peak_speed: number;
  readonly directional_consistency: number;
  readonly signal_quality: number;
  readonly motion_type: string;
  readonly region: readonly [number, number, number, number];
  readonly velocity: readonly number[];
  readonly progress: readonly number[];
}

export interface BeatCurveFile {
  readonly fps: number;
  readonly curves: readonly BeatCurve[];
}

export interface EasingFit<TEasing extends EasingSpec> {
  readonly easing: TEasing;
  /** RMSE between fitted and measured progress on normalised time (same metric as the Python scorer). */
  readonly progressRmse: number;
}

export interface FittedBeat {
  readonly beatId: number;
  readonly scene: string;
  readonly startFrame: number;
  readonly endFrame: number;
  readonly durationFrames: number;
  readonly durationMs: number;
  readonly channel: MotionChannel;
  readonly travel: number;
  readonly unit: string;
  readonly region: readonly [number, number, number, number];
  readonly signalQuality: number;
  readonly measuredOvershoot: number;
  readonly springFit: EasingFit<SpringEasing>;
  readonly bezierFit: EasingFit<BezierEasing>;
  readonly best: EasingFit<EasingSpec>;
  readonly nearestNamedEasing: { readonly name: string; readonly progressRmse: number };
}

export interface PresetCluster {
  readonly id: string;
  readonly channel: MotionChannel;
  readonly easing: EasingSpec;
  readonly medianDurationMs: number;
  readonly medianTravel: number;
  readonly memberBeatIds: readonly number[];
  readonly meanProgressRmse: number;
}
