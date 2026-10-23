import type { EasingSpec, MotionChannel } from "../runtime/motion-preset";
import { bezierCurve } from "./fit-bezier";
import { springCurve } from "./fit-spring";
import { progressRmse } from "./progress-error";
import type { FittedBeat, PresetCluster } from "./types";

const CURVE_SAMPLE_FRAMES = 60;

export interface ClusterOptions {
  readonly fittedBeats: readonly FittedBeat[];
  readonly fps: number;
  /** Two beats share a preset when their fitted curves differ by less than this RMSE. */
  readonly maxShapeDistance: number;
}

interface WorkingCluster {
  readonly representative: FittedBeat;
  readonly representativeCurve: number[];
  readonly members: FittedBeat[];
}

function easingCurve(easing: EasingSpec, fps: number): number[] {
  return easing.kind === "spring" ? springCurve(easing, CURVE_SAMPLE_FRAMES, fps) : bezierCurve(easing, CURVE_SAMPLE_FRAMES);
}

function median(values: readonly number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? ((sorted[middle - 1] ?? 0) + (sorted[middle] ?? 0)) / 2 : (sorted[middle] ?? 0);
}

function mostCommon<T>(values: readonly T[]): T {
  const counts = new Map<T, number>();
  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]![0];
}

function describeShape(beat: FittedBeat): string {
  const { easing } = beat.best;
  if (easing.kind === "spring") {
    const dampingRatio = easing.damping / (2 * Math.sqrt(easing.stiffness * easing.mass));
    if (easing.overshootClamping) return "spring-clamped";
    if (dampingRatio < 0.5) return "spring-bouncy";
    if (dampingRatio < 1) return "spring-soft-overshoot";
    return "spring-smooth";
  }
  return beat.nearestNamedEasing.progressRmse < 0.02 ? beat.nearestNamedEasing.name : "bezier-custom";
}

/** Greedy clustering by curve shape, highest-quality beats first so they become representatives. */
export function clusterPresets(options: ClusterOptions): PresetCluster[] {
  const ordered = [...options.fittedBeats].sort((a, b) => b.signalQuality - a.signalQuality || a.best.progressRmse - b.best.progressRmse);
  const clusters: WorkingCluster[] = [];
  for (const beat of ordered) {
    const curve = easingCurve(beat.best.easing, options.fps);
    const match = clusters.find((cluster) => progressRmse(cluster.representativeCurve, curve) < options.maxShapeDistance);
    if (match) {
      match.members.push(beat);
    } else {
      clusters.push({ representative: beat, representativeCurve: curve, members: [beat] });
    }
  }
  const nameCounts = new Map<string, number>();
  return clusters
    .sort((a, b) => b.members.length - a.members.length)
    .map((cluster) => {
      const shape = describeShape(cluster.representative);
      const index = (nameCounts.get(shape) ?? 0) + 1;
      nameCounts.set(shape, index);
      const channel: MotionChannel = mostCommon(cluster.members.map((member) => member.channel));
      const sameChannel = cluster.members.filter((member) => member.channel === channel);
      return {
        id: `${shape}-${String(index).padStart(2, "0")}`,
        channel,
        easing: cluster.representative.best.easing,
        medianDurationMs: Math.round(median(cluster.members.map((member) => member.durationMs))),
        medianTravel: Math.round(median(sameChannel.map((member) => member.travel)) * 100) / 100,
        memberBeatIds: cluster.members.map((member) => member.beatId).sort((a, b) => a - b),
        meanProgressRmse:
          Math.round((cluster.members.reduce((sum, member) => sum + member.best.progressRmse, 0) / cluster.members.length) * 10000) / 10000,
      };
    });
}
