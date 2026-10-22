import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { BezierEasing, SpringEasing } from "../runtime/motion-preset";
import { bezierCurve, fitBezier } from "./fit-bezier";
import { fitSpring, springCurve } from "./fit-spring";
import { progressRmse, resampleProgress } from "./progress-error";

const FPS = 60;

describe("progress-error", () => {
  it("resamples to 101 points with exact endpoints", () => {
    const samples = resampleProgress([0, 0.5, 1]);
    assert.equal(samples.length, 101);
    assert.equal(samples[0], 0);
    assert.equal(samples[100], 1);
    assert.equal(samples[50], 0.5);
  });

  it("is zero for identical curves regardless of sample count", () => {
    const curve = bezierCurve({ kind: "bezier", x1: 0.33, y1: 1, x2: 0.68, y2: 1 }, 40);
    assert.equal(progressRmse(curve, curve), 0);
  });
});

describe("fitBezier", () => {
  it("recovers a known ease-out-cubic curve to under 0.5% RMSE", () => {
    const truth: BezierEasing = { kind: "bezier", x1: 0.33, y1: 1, x2: 0.68, y2: 1 };
    const fit = fitBezier(bezierCurve(truth, 42));
    assert.ok(fit.progressRmse < 0.005, `rmse ${fit.progressRmse}`);
  });

  it("recovers a back (overshoot) curve", () => {
    const truth: BezierEasing = { kind: "bezier", x1: 0.34, y1: 1.56, x2: 0.64, y2: 1 };
    const fit = fitBezier(bezierCurve(truth, 36));
    assert.ok(fit.progressRmse < 0.01, `rmse ${fit.progressRmse}`);
    assert.ok(Math.max(...bezierCurve(fit.easing, 36)) > 1.05, "fitted curve should overshoot");
  });
});

describe("fitSpring", () => {
  it("recovers the damping of a bouncy Remotion spring", () => {
    const truth: SpringEasing = { kind: "spring", damping: 6, stiffness: 100, mass: 1, overshootClamping: false };
    const fit = fitSpring(springCurve(truth, 60, FPS), FPS);
    assert.ok(fit.progressRmse < 0.002, `rmse ${fit.progressRmse}`);
    assert.ok(Math.abs(fit.easing.damping - 6) <= 0.2, `damping ${fit.easing.damping}`);
    assert.equal(fit.easing.overshootClamping, false);
  });

  it("treats stiffness/mass as redundant once duration is fixed (same damping ratio, same curve)", () => {
    const base: SpringEasing = { kind: "spring", damping: 10, stiffness: 100, mass: 1, overshootClamping: false };
    const scaled: SpringEasing = { kind: "spring", damping: 20, stiffness: 400, mass: 1, overshootClamping: false };
    assert.ok(progressRmse(springCurve(base, 50, FPS), springCurve(scaled, 50, FPS)) < 0.002);
  });
});
