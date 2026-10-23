import type { BezierEasing } from "../runtime/motion-preset";
import { bezierProgress } from "../runtime/motion-preset";
import { progressRmse } from "./progress-error";
import type { EasingFit } from "./types";

/** CSS cubic-bezier: x control points must stay in [0, 1]; y may leave it for back/anticipation. */
const X_RANGE = { min: 0, max: 1 } as const;
const Y_RANGE = { min: -0.6, max: 1.6 } as const;
const COARSE_STEP = 0.2;
const REFINE_STEPS = [0.05, 0.02, 0.01] as const;

export const NAMED_EASINGS: ReadonlyArray<{ readonly name: string; readonly easing: BezierEasing }> = [
  { name: "linear", easing: { kind: "bezier", x1: 0, y1: 0, x2: 1, y2: 1 } },
  { name: "css-ease", easing: { kind: "bezier", x1: 0.25, y1: 0.1, x2: 0.25, y2: 1 } },
  { name: "css-ease-in", easing: { kind: "bezier", x1: 0.42, y1: 0, x2: 1, y2: 1 } },
  { name: "css-ease-out", easing: { kind: "bezier", x1: 0, y1: 0, x2: 0.58, y2: 1 } },
  { name: "css-ease-in-out", easing: { kind: "bezier", x1: 0.42, y1: 0, x2: 0.58, y2: 1 } },
  { name: "ease-out-cubic", easing: { kind: "bezier", x1: 0.33, y1: 1, x2: 0.68, y2: 1 } },
  { name: "ease-out-quint", easing: { kind: "bezier", x1: 0.22, y1: 1, x2: 0.36, y2: 1 } },
  { name: "ease-out-expo", easing: { kind: "bezier", x1: 0.16, y1: 1, x2: 0.3, y2: 1 } },
  { name: "ease-in-out-cubic", easing: { kind: "bezier", x1: 0.65, y1: 0, x2: 0.35, y2: 1 } },
  { name: "ease-in-out-quint", easing: { kind: "bezier", x1: 0.83, y1: 0, x2: 0.17, y2: 1 } },
  { name: "ease-out-back", easing: { kind: "bezier", x1: 0.34, y1: 1.56, x2: 0.64, y2: 1 } },
  { name: "ease-in-out-back", easing: { kind: "bezier", x1: 0.68, y1: -0.6, x2: 0.32, y2: 1.6 } },
];

export function bezierCurve(easing: BezierEasing, durationFrames: number): number[] {
  return Array.from({ length: durationFrames + 1 }, (_, frame) => bezierProgress(easing, frame / durationFrames));
}

function clamp(value: number, range: { min: number; max: number }): number {
  return Math.min(range.max, Math.max(range.min, value));
}

function roundBezier(easing: BezierEasing): BezierEasing {
  const round = (value: number): number => Math.round(value * 1000) / 1000;
  return { kind: "bezier", x1: round(easing.x1), y1: round(easing.y1), x2: round(easing.x2), y2: round(easing.y2) };
}

export function scoreBezier(easing: BezierEasing, measured: readonly number[]): EasingFit<BezierEasing> {
  return { easing, progressRmse: progressRmse(measured, bezierCurve(easing, measured.length - 1)) };
}

function gridValues(range: { min: number; max: number }, step: number): number[] {
  const count = Math.round((range.max - range.min) / step) + 1;
  return Array.from({ length: count }, (_, index) => range.min + index * step);
}

function coarseSearch(measured: readonly number[]): EasingFit<BezierEasing> {
  let best = scoreBezier(NAMED_EASINGS[0]!.easing, measured);
  for (const named of NAMED_EASINGS) {
    const candidate = scoreBezier(named.easing, measured);
    if (candidate.progressRmse < best.progressRmse) best = candidate;
  }
  const xValues = gridValues(X_RANGE, COARSE_STEP);
  const yValues = gridValues(Y_RANGE, COARSE_STEP);
  for (const x1 of xValues) for (const y1 of yValues) for (const x2 of xValues) for (const y2 of yValues) {
    const candidate = scoreBezier({ kind: "bezier", x1, y1, x2, y2 }, measured);
    if (candidate.progressRmse < best.progressRmse) best = candidate;
  }
  return best;
}

/** Coordinate descent: nudge one control value at a time while the error keeps falling. */
function refine(start: EasingFit<BezierEasing>, measured: readonly number[]): EasingFit<BezierEasing> {
  let best = start;
  const keys = ["x1", "y1", "x2", "y2"] as const;
  for (const step of REFINE_STEPS) {
    let improved = true;
    while (improved) {
      improved = false;
      for (const key of keys) {
        for (const direction of [-1, 1]) {
          const range = key.startsWith("x") ? X_RANGE : Y_RANGE;
          const nudged: BezierEasing = { ...best.easing, [key]: clamp(best.easing[key] + direction * step, range) };
          const candidate = scoreBezier(nudged, measured);
          if (candidate.progressRmse < best.progressRmse - 1e-7) {
            best = candidate;
            improved = true;
          }
        }
      }
    }
  }
  return { easing: roundBezier(best.easing), progressRmse: best.progressRmse };
}

export function fitBezier(measured: readonly number[]): EasingFit<BezierEasing> {
  return refine(coarseSearch(measured), measured);
}

export function nearestNamedEasing(measured: readonly number[]): { name: string; progressRmse: number } {
  return NAMED_EASINGS.map((named) => ({ name: named.name, progressRmse: scoreBezier(named.easing, measured).progressRmse }))
    .reduce((best, candidate) => (candidate.progressRmse < best.progressRmse ? candidate : best));
}
