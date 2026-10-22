import type { SpringEasing } from "../runtime/motion-preset";
import { springProgress } from "../runtime/motion-preset";
import { progressRmse } from "./progress-error";
import type { EasingFit } from "./types";

/**
 * With `durationInFrames` set, Remotion stretches the spring to that length, so the curve shape
 * depends only on the damping ratio (damping / (2 * sqrt(stiffness * mass))). We therefore fix
 * stiffness and mass and search damping, with and without overshoot clamping.
 */
const FIXED_STIFFNESS = 100;
const FIXED_MASS = 1;
const COARSE_DAMPING_RANGE = { min: 1, max: 80, step: 0.5 } as const;
const REFINE_RADIUS = 0.5;
const REFINE_STEP = 0.05;

export function springCurve(easing: SpringEasing, durationFrames: number, fps: number): number[] {
  return Array.from({ length: durationFrames + 1 }, (_, frame) =>
    springProgress(easing, { frame, fps, durationInFrames: durationFrames }),
  );
}

function makeSpring(damping: number, overshootClamping: boolean): SpringEasing {
  return { kind: "spring", damping: Math.round(damping * 100) / 100, stiffness: FIXED_STIFFNESS, mass: FIXED_MASS, overshootClamping };
}

function scoreSpring(options: { easing: SpringEasing; measured: readonly number[]; fps: number }): EasingFit<SpringEasing> {
  const durationFrames = options.measured.length - 1;
  return { easing: options.easing, progressRmse: progressRmse(options.measured, springCurve(options.easing, durationFrames, options.fps)) };
}

function dampingValues(range: { min: number; max: number; step: number }): number[] {
  const count = Math.floor((range.max - range.min) / range.step) + 1;
  return Array.from({ length: count }, (_, index) => range.min + index * range.step);
}

export function fitSpring(measured: readonly number[], fps: number): EasingFit<SpringEasing> {
  let best: EasingFit<SpringEasing> | undefined;
  for (const overshootClamping of [false, true]) {
    for (const damping of dampingValues(COARSE_DAMPING_RANGE)) {
      const candidate = scoreSpring({ easing: makeSpring(damping, overshootClamping), measured, fps });
      if (!best || candidate.progressRmse < best.progressRmse) best = candidate;
    }
  }
  if (!best) throw new Error("Spring search produced no candidates");
  const coarseBest = best;
  const refineRange = {
    min: Math.max(0.1, coarseBest.easing.damping - REFINE_RADIUS),
    max: coarseBest.easing.damping + REFINE_RADIUS,
    step: REFINE_STEP,
  };
  for (const damping of dampingValues(refineRange)) {
    const candidate = scoreSpring({ easing: makeSpring(damping, coarseBest.easing.overshootClamping), measured, fps });
    if (candidate.progressRmse < best.progressRmse) best = candidate;
  }
  return best;
}
