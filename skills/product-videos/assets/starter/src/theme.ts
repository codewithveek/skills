import { FONTS, stack } from "./kit/fonts";

// Retheme here. Copy the product's real tokens (its CSS variables, Tailwind config or design file),
// value for value, so the rebuilt screens are indistinguishable from the app. The UI font defaults to
// Inter (bundled, src/kit/fonts.ts); if the product uses another, add its files there and point this at it.
export const fontFamily = stack(FONTS.sans);
export const monoFamily = stack(FONTS.mono, "monospace");

/** Stage colours: backdrops, title cards and headlines around the app window. */
export const c = {
  brand: "#0075ff",
  brand300: "#4c9aff",
  canvas: "#09090b",
  surface: "#18181b",
  ink: "#fafafa",
  muted: "#a1a1aa",
  faint: "#71717a",
  green: "#57d9a3",
  amber: "#ffc400",
  red: "#ff8f73",
};

/** The logical screen app scenes are drawn on. Match the real app's screenshots (1440x900 is a laptop viewport). */
export const SCREEN = { w: 1440, h: 900 };
export const FPS = 30;
