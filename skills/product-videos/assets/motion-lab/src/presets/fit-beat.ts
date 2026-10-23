import type { EasingSpec, MotionChannel } from "../runtime/motion-preset";
import { fitBezier, nearestNamedEasing } from "./fit-bezier";
import { fitSpring } from "./fit-spring";
import type { AnalysisChannel, BeatCurve, EasingFit, FittedBeat } from "./types";

/** Prefer a spring when it is nearly as good: springs re-time cleanly and read as more physical. */
const SPRING_PREFERENCE_MARGIN = 0.003;

const CHANNEL_MAP: Record<AnalysisChannel, MotionChannel> = {
  translate_x: "translateX",
  translate_y: "translateY",
  scale: "scale",
  speed: "progress",
};

export function fitBeat(curve: BeatCurve, fps: number): FittedBeat {
  const springFit = fitSpring(curve.progress, fps);
  const bezierFit = fitBezier(curve.progress);
  const best: EasingFit<EasingSpec> =
    springFit.progressRmse <= bezierFit.progressRmse + SPRING_PREFERENCE_MARGIN ? springFit : bezierFit;
  const channel = CHANNEL_MAP[curve.channel];
  return {
    beatId: curve.beat_id,
    scene: curve.scene,
    startFrame: curve.start_frame,
    endFrame: curve.end_frame,
    durationFrames: curve.duration_frames,
    durationMs: Math.round((curve.duration_frames / fps) * 1000 * 1000) / 1000,
    channel,
    travel: channel === "progress" ? 1 : Math.round(curve.travel * 100) / 100,
    unit: channel === "progress" ? "progress" : curve.unit,
    region: curve.region,
    signalQuality: curve.signal_quality,
    measuredOvershoot: Math.round((Math.max(...curve.progress) - 1) * 10000) / 10000,
    springFit,
    bezierFit,
    best,
    nearestNamedEasing: nearestNamedEasing(curve.progress),
  };
}
