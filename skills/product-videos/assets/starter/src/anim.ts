import { Easing, interpolate, spring } from "remotion";
import { FPS } from "./theme";

export const ease = Easing.bezier(0.65, 0, 0.35, 1); // in-out, for camera and cursor travel
export const easeOut = Easing.bezier(0.16, 1, 0.3, 1); // fast start, long settle, for entrances

/** 0 → 1 between two frames, eased and clamped. */
export const progress = (frame: number, from: number, to: number, easing = easeOut) =>
  interpolate(frame, [from, to], [0, 1], { easing, extrapolateLeft: "clamp", extrapolateRight: "clamp" });

/** A spring that starts at `delay`, 0 → 1. */
export const pop = (frame: number, delay = 0, stiffness = 180, damping = 18) =>
  spring({ frame: frame - delay, fps: FPS, config: { stiffness, damping, mass: 1 } });

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** An entrance: fade in, rise and unblur. */
export const rise = (frame: number, delay = 0, distance = 24, duration = 18) => {
  const t = progress(frame, delay, delay + duration);
  return {
    opacity: t,
    transform: `translateY(${(1 - t) * distance}px)`,
    filter: `blur(${(1 - t) * 8}px)`,
  } as const;
};

export type Key = { f: number; x: number; y: number; s?: number };

/** Interpolate keyframes; each leg eases in and out. */
export const track = (frame: number, keys: Key[]) => {
  if (frame <= keys[0].f) return { x: keys[0].x, y: keys[0].y, s: keys[0].s ?? 1 };
  for (let i = 0; i < keys.length - 1; i++) {
    const a = keys[i];
    const b = keys[i + 1];
    if (frame <= b.f) {
      const t = progress(frame, a.f, b.f, ease);
      return { x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t), s: lerp(a.s ?? 1, b.s ?? 1, t) };
    }
  }
  const z = keys[keys.length - 1];
  return { x: z.x, y: z.y, s: z.s ?? 1 };
};

export const money = (n: number, symbol = "$", decimals = 2) =>
  symbol + n.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

/** Characters typed so far, at `cps` characters per second from `start`. */
export const typed = (frame: number, text: string, start: number, cps = 16) =>
  text.slice(0, Math.max(0, Math.floor(((frame - start) / FPS) * cps)));
