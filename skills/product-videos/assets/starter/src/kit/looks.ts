import { createContext, useContext, type CSSProperties } from "react";
import { c } from "../theme";
import { FONTS, stack } from "./fonts";

// A look is a video's visual style: the stage colours, the display font, how scenes hand over to
// each other and how fast it moves. The video *type* (launch, tutorial, explainer …) decides the
// structure; the look decides how it feels. See references/visual-styles.md.

// Typefaces from measured reference launches (references/visual-styles.md): Inter with its Display
// optical size for the sans looks, EB Garamond for editorial, Instrument Serif italic as cinematic's accent.
const sans = stack(FONTS.sans);
const serif = stack(FONTS.serif, "serif");

export type TransitionName = "fade" | "focus" | "circle" | "panel" | "slab" | "zoom" | "push" | "cut" | "rise" | "wipe";

/** How `*starred*` accent words are set: another face (usually an italic serif), optionally scaled to match. */
export type AccentFont = { family: string; style: "italic" | "normal"; weight?: number; scale?: number };

export type Look = {
  name: LookName;
  /** Display font for headlines and big numbers */
  font: string;
  /** Font for small text around the product: labels, card names, meters, chips */
  textFont: string;
  /** Face for accent words; without it they change colour only (or take the gradient, in showcase) */
  accentFont?: AccentFont;
  /** Stage colours. `accent` is the brand colour; `alarm` colours the problem ("That's it.", "Restricted"). */
  canvas: string;
  ink: string;
  muted: string;
  line: string;
  accent: string;
  /** Two-stop gradient for accent words and wipes (showcase). Other looks colour accents flat with `accent`. */
  gradient?: readonly [string, string];
  onAccent: string;
  alarm: string;
  /** A card sitting on the stage (person cards, floating UI snippets) */
  card: string;
  cardShadow: string;
  /** Headline weight and tracking: studio is bold, editorial a medium serif, graphic semi-bold and very tight */
  weight: number;
  tracking: number;
  /** The default hand-over between scenes, and its length in frames (the timeline's crossfade) */
  transition: TransitionName;
  crossfade: number;
  /** Suggested music file and whether transitions get a whoosh */
  music: string;
  whoosh: number;
};

export type LookName = "studio" | "editorial" | "graphic" | "cinematic" | "showcase";

export const LOOKS: Record<LookName, Look> = {
  // Dark stage, the app window front and centre, camera and cursor. The original kit look.
  studio: {
    name: "studio", font: sans, textFont: sans, canvas: c.canvas, ink: c.ink, muted: c.muted, line: "rgba(255,255,255,0.08)",
    accent: c.brand, onAccent: "#ffffff", alarm: c.red, card: c.surface, cardShadow: "0 30px 80px rgba(0,0,0,0.5)",
    weight: 700, tracking: -0.025, transition: "fade", crossfade: 12, music: "music/upbeat.wav", whoosh: 0.2,
  },
  // Warm paper, one big number or claim per scene, floating cards, focus-pull cuts, brand-colour
  // circle reveals for brand moments. Calm, confident, numbers-led. Headlines and numbers in a
  // Garamond with italic accent words (learned from a measured voice-app launch).
  editorial: {
    name: "editorial", font: serif, textFont: sans, accentFont: { family: stack(FONTS.serif, "serif"), style: "italic", weight: 500 }, canvas: "#efeee9", ink: "#141414", muted: "#77756f", line: "#cfcdc6",
    accent: c.brand, onAccent: "#ffffff", alarm: "#d4483a", card: "#ffffff", cardShadow: "0 18px 40px rgba(40,36,28,0.14), 0 2px 6px rgba(40,36,28,0.08)",
    weight: 500, tracking: -0.012, transition: "focus", crossfade: 14, music: "music/bed.wav", whoosh: 0.12,
  },
  // Flat white, one loud brand colour, a modular grid, pixel/dot motifs, full-bleed colour slabs.
  // Fast and graphic; built for products with little UI (APIs, infrastructure, data).
  graphic: {
    name: "graphic", font: sans, textFont: sans, canvas: "#fafafa", ink: "#111111", muted: "#8a8a8a", line: "#e7e7e7",
    accent: c.brand, onAccent: "#ffffff", alarm: c.brand, card: "#ffffff", cardShadow: "0 1px 0 #e7e7e7, 0 10px 30px rgba(0,0,0,0.06)",
    weight: 600, tracking: -0.04, transition: "slab", crossfade: 12, music: "music/upbeat.wav", whoosh: 0.16,
  },
  // Near-black, a soft glow, large light type, slow focus pulls. Premium, quiet launches. Accent words
  // in a condensed italic serif, the way modern brand films pair a grotesk with an italic.
  cinematic: {
    name: "cinematic", font: sans, textFont: sans, accentFont: { family: stack(FONTS.displaySerif, "serif"), style: "italic", weight: 400, scale: 1.14 }, canvas: "#050507", ink: "#f4f4f5", muted: "#8b8b94", line: "rgba(255,255,255,0.08)",
    accent: c.brand, onAccent: "#ffffff", alarm: "#ff7a6b", card: "#111114", cardShadow: "0 40px 120px rgba(0,0,0,0.7)",
    weight: 500, tracking: -0.025, transition: "focus", crossfade: 20, music: "music/bed.wav", whoosh: 0.1,
  },
  // White, airy, a brand-to-violet gradient on accent words, words that drop in along curves, live UI
  // demos with an agent at work, cards lifting out of the screen. Timed with motion measured from a
  // real launch (kit/measured): in-out curves that peak mid-move, short holds, near-continuous motion.
  showcase: {
    name: "showcase", font: sans, textFont: sans, canvas: "#ffffff", ink: "#111118", muted: "#6b6b78", line: "#e7e7f0",
    accent: c.brand, gradient: [c.brand, "#a855f7"], onAccent: "#ffffff", alarm: "#e5484d", card: "#ffffff",
    cardShadow: "0 24px 60px rgba(60,40,140,0.14), 0 2px 8px rgba(60,40,140,0.08)",
    weight: 500, tracking: -0.02, transition: "rise", crossfade: 12, music: "music/upbeat.wav", whoosh: 0.12,
  },
};

export const LookContext = createContext<Look>(LOOKS.studio);
/** The current video's look. makeVideo provides it from the timeline's `look`; scene compositions get it too. */
export const useLook = () => useContext(LookContext);

/** Style for an accent word in this look: its accent face (if any), weight and size match. Colour is the caller's. */
export const accentStyle = (look: Look): CSSProperties =>
  look.accentFont
    ? { fontFamily: look.accentFont.family, fontStyle: look.accentFont.style, fontWeight: look.accentFont.weight ?? look.weight, fontSize: `${look.accentFont.scale ?? 1}em`, letterSpacing: "normal" }
    : {};
