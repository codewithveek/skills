import type { MotionPreset } from "./preset";

export { easingOf, measured, presetFrames } from "./preset";
export type { BezierEasing, EasingSpec, MeasuredOptions, MotionChannel, MotionPreset, SpringEasing } from "./preset";
export { SAAS_LAUNCH } from "./saas-launch";

/**
 * Measured motion, named by job. Each role is a shape cluster from the measured reference library
 * (`saas-launch.ts`, a 108-second launch video for an AI web app, 157 beats fitted): the cluster's
 * easing, its median duration, and how many beats of the reference moved that way. Roles were named
 * from where the beats occur in the reference; references/motion-data.md has the full table.
 *
 * Use with `measured(frame, at, MOTION.role)` or `easingOf(MOTION.role.easing)`.
 */
export const MOTION = {
  /** A scroll or step inside a live UI demo (an agent moving down a form). Tiny wind-up, quick, firm stop. 11 beats. */
  scrollStep: { id: "scrollStep", channel: "translateY", durationMs: 333, travel: -280.88, easing: { kind: "bezier", x1: 0.6, y1: -0.04, x2: 0.55, y2: 0.97 } },
  /** Something settling into place over a short distance (a logo, a card, a panel). Slow start, long soft landing. 8 beats. */
  settle: { id: "settle", channel: "translateY", durationMs: 767, travel: -36.81, easing: { kind: "bezier", x1: 0.42, y1: -0.01, x2: 0.2, y2: 1.02 } },
  /** A full-screen horizontal pan from one view to the next (about 1,000 px). Symmetric in-out, peak speed mid-way. 6 beats. */
  screenPan: { id: "screenPan", channel: "translateX", durationMs: 600, travel: -1029.48, easing: { kind: "bezier", x1: 0.69, y1: -0.01, x2: 0.3, y2: 0.99 } },
  /** Lines of text moving up into place (headlines, a typed line making room). Quick acceleration, strong deceleration. 5 beats. */
  textRise: { id: "textRise", channel: "translateY", durationMs: 433, travel: -288.73, easing: { kind: "bezier", x1: 0.18, y1: 0.01, x2: 0.4, y2: 0.96 } },
  /** One step of a chain of moves that flows into the next: still moving when it ends. Short. 5 beats. */
  chainStep: { id: "chainStep", channel: "translateY", durationMs: 217, travel: -147.69, easing: { kind: "bezier", x1: 0.5, y1: 0.2, x2: 0.51, y2: 0.77 } },
  /** A swap or resize that lands with a ~10% overshoot (a frame resizing to new words, a card swapping in, a wipe). 4 beats. */
  swapOvershoot: { id: "swapOvershoot", channel: "translateY", durationMs: 608, travel: -342.87, easing: { kind: "bezier", x1: 0.62, y1: -0.05, x2: 0.26, y2: 1.1 } },
  /** Headline words arriving sideways along their path and settling; a clamped spring, so no bounce. 4 beats. */
  wordSettle: { id: "wordSettle", channel: "translateX", durationMs: 683, travel: -460.91, easing: { kind: "spring", damping: 12.3, stiffness: 100, mass: 1, overshootClamping: true } },
  /** A move that pulls back slightly first (anticipation), then goes. 4 beats. */
  anticipate: { id: "anticipate", channel: "translateY", durationMs: 517, travel: 255.85, easing: { kind: "bezier", x1: 0.78, y1: -0.2, x2: 0.55, y2: 1.03 } },
  /** A long, fast streak across the frame (a light trail, a feed sweeping past). Clamped spring. 2 beats. */
  streak: { id: "streak", channel: "translateX", durationMs: 1075, travel: -1426.72, easing: { kind: "spring", damping: 9.35, stiffness: 100, mass: 1, overshootClamping: true } },
  /** A big move that lands very softly (expo-like tail): a line drawing in, a panel arriving from far. 2 beats. */
  longSettle: { id: "longSettle", channel: "translateY", durationMs: 1100, travel: -841.83, easing: { kind: "bezier", x1: 0.2, y1: 0, x2: 0.02, y2: 0.97 } },
  /** A long pan that overshoots by ~9% and comes back. 2 beats. */
  panOvershoot: { id: "panOvershoot", channel: "translateX", durationMs: 1267, travel: -959.47, easing: { kind: "bezier", x1: 0.4, y1: -0.04, x2: 0.04, y2: 1.09 } },
  /** A panel popping in by scale with a strong overshoot (a dropdown, a side panel). 2 beats. */
  popScale: { id: "popScale", channel: "scale", durationMs: 775, travel: 61.33, easing: { kind: "bezier", x1: 0.6, y1: -0.16, x2: 0.16, y2: 1.47 } },
} as const satisfies Record<string, MotionPreset>;

export type MotionRole = keyof typeof MOTION;
